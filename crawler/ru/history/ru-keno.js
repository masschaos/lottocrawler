const log = require('../../../util/log')

const name = 'keno'
const lotteryID = 'ru-keno'
// const other = []
// const jackpot = []
// const drawTime = ''
// const issue = ''
// const number = ''
// const detail = []
// const breakdown = [{"name":"main", "detail":[{"name": "", "count": "", "prize": ""}]}]

const url = 'https://stoloto.ru/keno/archive'
const selector = '#content > div.data.drawings_data'
const selectorAll = '#content > div.data.drawings_data .elem'
const detailTotal = '#content > div.col.prizes > div.results_table.with_bottom_shadow > div > table > tbody > tr'
const detailWaitfor = '#content > div.col.prizes > div.results_table.with_bottom_shadow > div > table'

const moreDetail = '#content > div.col.drawing_details > div > div > table > tbody > tr'

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
      data.drawTime = `${year}${month}${day}${time}`
      data.issue = element.querySelector('.draw').innerText
      data.drawUrl = element.querySelector('.draw a').href
      // data.other = []
      data.jackpot = []
      const tmp1 = element.querySelector('.elem .numbers_wrapper .container')
      const tmp2 = element.querySelector('.elem .sub')
      let numberOne = [...tmp1.querySelectorAll('.zone > b')].map(item => item.innerText)
      let numberTwo = [...tmp2.querySelectorAll('.zone > b')].map(item => item.innerText)
      numberOne = numberOne.map(item => item.trim())
      numberTwo = numberTwo.map(item => item.trim()).slice(1, numberTwo.length)

      if (numberOne.length === 0 || numberTwo.length === 0) {
        throw new Error('DrawingError', `正在开奖中，无法获取结果。彩种: ${lotteryID}`)
      }
      // data.numbers = [numbers.slice(0, 2).join(','), numbers.slice(2, 4).join(',')].join('|')
      console.log(JSON.stringify(numberOne), JSON.stringify(numberTwo), 'one, two') // eslint-disable-line
      data.numbers = [numberOne.join(','), numberTwo.join(',')].join('|')
      console.log(data.numbers, 'numbers') // eslint-disable-line
      // data.numbers = numbers.split(' ').map(item => item.slice(0, item.length - 1))
      //   log.debug(element.querySelector('.prize').outerHTML)
      data.super_prize = element.querySelector('.prize').innerText
      return data
    }
    const results = [...document.querySelectorAll(selectorAll)]
    const TotalData = results.map(item => { return mapFunction(item) })
    return TotalData
  }, selectorAll, MONTH, lotteryID)
  page.close()
  // log.debug(CrawResult, 'CrawResult')
  return CrawResult
}
const CrawDetail = async (url, selector, moreDetail) => {
  const page = await newPage()
  await page.goto(url)
  await page.waitForSelector(detailWaitfor)

  const Crawdetail = await page.evaluate((selector, moreDetail) => {
    const mapFunction = (element) => {
      const elementList = [...element.querySelectorAll('td')].map(item => item.textContent.trim()).slice(1)
      return elementList
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
    const dataList = results.map(mapFunction).slice(0, -1)
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
    // console.log(mainDataList, 'mainData')
    for (let i = 0; i < mainDataList.length; i++) {
      // log.debug(mainData, 'mainData')
      const detail = await CrawDetail(mainDataList[i].drawUrl, detailTotal, moreDetail).then(data => { return data })
      const numbers = mainDataList[i].numbers
      const details = [{ twoDimensionalList: detail[0].map(item => { return { value: item } }) }]
      const newData = { ...mainDataList[i], numbers, detail: details, lotteryID, name, jackpot: [mainDataList[i].super_prize] }
      newData.other = detail[1]
      delete newData.drawUrl
      delete newData.super_prize
      results.push(newData)
    }
  } catch (err) {
    log.debug(err)
  } finally {
    writeJsonToFile(lotteryID, results)
  }
}
crawl()
module.exports = {
  crawl
}
