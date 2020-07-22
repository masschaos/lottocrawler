const name = 'duel'
const lotteryID = 'ru-duel'
// const other = []
// const jackpot = []
// const drawTime = ''
// const issue = ''
// const number = ''
// const detail = []
// const breakdown = [{"name":"main", "detail":[{"name": "", "count": "", "prize": ""}]}]

// 两个箱子，都是1-26 开奖，每个箱子两个号码

const selector = '#content > div.data.drawings_data'
const selectorAll = '#content > div.data.drawings_data .month'
const detailTotal = '#content > div.col.prizes > div.results_table.with_bottom_shadow > div > table > tbody > tr'
const detailWaitfor = '#content > div.col.prizes > div.results_table.with_bottom_shadow > div > table'

const moreDetail = '#content > div.col.drawing_details > div > div > table > tbody > tr'

const url = 'https://www.stoloto.ru/duel/archive'
const { newPage } = require('../../../pptr')
const { MONTH, TurnPage, writeJsonToFile } = require('../country')
const Craw = async (page, url, selectorAll, lotteryID) => {
  const CrawResult = await page.evaluate((selectorAll, MONTH, lotteryID) => {
    const mapFunction = (element) => {
      const data = {}
      const drawDate = element.querySelector('.draw_date').innerText
      const [yearPro, dayPro] = drawDate.split(' ')
      const time = dayPro.split(':').join('')
      const [day, month, year] = yearPro.split('.')
      data.drawTime = `${year}${month}${day}${time}00`
      data.issue = element.querySelector('.draw').innerText
      data.drawUrl = element.querySelector('.draw a').href
      // data.other = []
      data.jackpot = []

      let numbers = [...element.querySelectorAll('#content > div.data.drawings_data > div.month > div:nth-child(2) > div > div.numbers > div.numbers_wrapper > div:nth-child(1) > span b')].map(item => item.innerText)
      numbers = numbers.map(item => item.trim())
      if (numbers.length === 0) {
        throw new Error('DrawingError', `正在开奖中，无法获取结果。彩种: ${lotteryID}`)
      }
      data.numbers = [numbers.slice(0, 2).join(','), numbers.slice(2, 4).join(',')].join('|')
      console.log(data.numbers, 'data number')
      data.super_prize = element.querySelector('.prize').innerText
      return data
    }
    const results = [...document.querySelectorAll(selectorAll)]
    const TotalData = results.map(item => { return mapFunction(item) })
    return TotalData
  }, selectorAll, MONTH, lotteryID)
  page.close()
  console.log(CrawResult, 'CrawResult')
  return CrawResult
}
const CrawDetail = async (url, selector) => {
  const page = await newPage()
  await page.goto(url)
  await page.waitForSelector(detailWaitfor)

  const Crawdetail = await page.evaluate((selector, moreDetail) => {
    const mapFunction = (element) => {
      const data = {}
      const elementList = [...element.querySelectorAll('td')]
      data.level = elementList[0].textContent
      data.numbersOfWinners = elementList[1].textContent
      data.wininrub = elementList[2].textContent
      data.winners = elementList[3].textContent.replace(/\n/g, '').split('\t').join('')
      return data
    }
    const moreDetailFunction = (element) => {
      const data = {}
      const elementList = [...element.querySelectorAll('td')]
      data.name = elementList[0].textContent.trim()
      data.value = elementList[1].textContent.trim()
      return data
    }
    const results = [...document.querySelectorAll(selector)]
    const moreDetailData = [...document.querySelectorAll(moreDetail)]
    const dataList = results.map(mapFunction)
    const otherData = moreDetailData.map(moreDetailFunction)
    return [dataList, otherData]
  }, selector, moreDetail)
  page.close()
  return Crawdetail
}

const crawl = async () => {
  const page = await TurnPage(url, selector)
  const results = []
  try {
    const mainDataList = await Craw(page, url, selectorAll, lotteryID)
    for (let i = 0; i < mainDataList.length; i++) {
      const detail = await CrawDetail(mainDataList[i].drawUrl, detailTotal, moreDetail).then(data => { return data })
      const numbers = mainDataList[i].numbers
      const details = detail[0].map(item => { return { level: item.level, total_winner: item.winners, wininrub: item.wininrub, numbersOfWinners: item.numbersOfWinners } })
      const newData = { ...mainDataList[i], numbers, detail: details, lotteryID, name, jackpot: [mainDataList[i].super_prize] }
      newData.other = detail[1]
      delete newData.drawUrl
      delete newData.super_prize
      console.log(newData)
      results.push(newData)
    }
  } catch (err) {
    console.log(err)
  } finally {
    writeJsonToFile(lotteryID, results)
  }
}

crawl()
module.exports = {
  crawl
}
