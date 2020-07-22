const name = '12x24'
const lotteryID = 'ru-12x24'
// const other = []
// const jackpot = []
// const drawTime = ''
// const issue = ''
// const number = ''
// const detail = []
// const breakdown = [{"name":"main", "detail":[{"name": "", "count": "", "prize": ""}]}]
// 1-24 选出12个数字。

// 开奖
// 1-24 开出20个数字按照顺序 小于10 不加0在前面
const selector = '#content > div.data.drawings_data'
const selectorAll = '#content > div.data.drawings_data .month'
const detailTotal = '#content > div.col.prizes > div.results_table.with_bottom_shadow > div > table > tbody > tr'
const detailWaitfor = '#content > div.col.prizes > div.results_table.with_bottom_shadow > div > table'

const moreDetail = '#content > div.col.drawing_details > div > div > table > tbody > tr'

const url = 'https://stoloto.ru/12x24/archive'
const { newPage } = require('../../../pptr')
const { MONTH } = require('../country')
const Craw = async (url, selectorAll, lotteryID) => {
  const page = await newPage()
  const waitfor = selector
  await page.goto(url)
  await page.waitForSelector(waitfor)
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

      const numbers = [...element.querySelectorAll('#content > div.data.drawings_data > div.month > div:nth-child(2) > div > div.numbers > div.numbers_wrapper > div:nth-child(1) > span b')].map(item => item.innerText)
      console.log(numbers)
      if (numbers.length === 0) {
        throw new Error('DrawingError', `正在开奖中，无法获取结果。彩种: ${lotteryID}`)
      }
      data.numbers = numbers.map(item => item.trim()).join(',')
      // data.numbers = numbers.split(' ').map(item => item.slice(0, item.length - 1))

      console.log(data.numbers, 'data number')
      //   console.log(element.querySelector('.prize').outerHTML)
      data.super_prize = element.querySelector('.prize').innerText
      return data
    }
    const results = document.querySelector(selectorAll)
    // console.log(results)
    const TotalData = mapFunction(results)
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
  const mainData = await Craw(url, selectorAll, lotteryID)
  const detail = await CrawDetail(mainData.drawUrl, detailTotal, moreDetail).then(data => { return data })
  const numbers = mainData.numbers
  const details = detail[0].map(item => { return { level: item.level, total_winner: item.winners, wininrub: item.wininrub, numbersOfWinners: item.numbersOfWinners } })
  const newData = { ...mainData, numbers, detail: details, lotteryID, name, jackpot: [mainData.super_prize] }
  newData.other = detail[1]
  delete newData.drawUrl
  delete newData.super_prize
  console.log(newData)
  return newData
}

module.exports = {
  crawl
}