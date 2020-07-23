const url = 'https://www.stoloto.ru/6x36/archive'
const selector = '#content > div.data.drawings_data'
const selectorAll = '#content > div.data.drawings_data .month'
const detailTotal = '#content > div.col.prizes > div.results_table.with_bottom_shadow > div > table > tbody > tr'
const detailWaitfor = '#content > div.col.prizes > div.results_table.with_bottom_shadow > div > table'
const lotteryID = 'ru-6-out-of-36'
const name = '6 из 36'

const { DrawingError } = require('../../../util/error')
const { MONTH } = require('../country')
const VError = require('verror')
const { newPage, ignoreImage } = require('../../../pptr')
const Craw = async (page, url, selectorAll) => {
  try {
    await page.goto(url)
    await page.waitForSelector(selector)
    const CrawResult = await page.evaluate((selectorAll, MONTH) => {
      const mapFunction = (element) => {
        const data = {}
        const drawDate = element.querySelector('.draw_date').innerText
        const [yearPro, dayPro] = drawDate.split(' ')
        const time = dayPro.split(':').join('')
        const [day, month, year] = yearPro.split('.')
        data.drawTime = `${year}${month}${day}${time}00`
        data.issue = element.querySelector('.draw').innerText
        data.drawUrl = element.querySelector('.draw a').href
        data.other = []
        data.jackpot = []
        const numberText = element.querySelector('.numbers_wrapper').innerText
        data.numbers = numberText.split(' ').map((item) => item.slice(0, -1)).join(',')
        data.super_prize = element.querySelector('.prize').innerText
        return data
      }
      const results = document.querySelector(selectorAll)
      const TotalData = mapFunction(results)
      // console.log(TotalData)
      return TotalData
    }, selectorAll, MONTH)
    return CrawResult
  } catch (err) {
    throw new VError(err, '爬虫发生预期外错误')
  }
}

const CrawDetail = async (page, url, selector) => {
  try {
    await page.goto(url)
    await page.waitForSelector(detailWaitfor)

    const Crawdetail = await page.evaluate((selector) => {
      const mapFunction = (element) => {
        const data = {}
        const elementList = [...element.querySelectorAll('td')]
        data.level = elementList[0].textContent
        data.winners = elementList[2].textContent
        return data
      }
      const results = [...document.querySelectorAll(selector)]
      const dataList = results.map(mapFunction)
      return dataList
    }, selector)
    return Crawdetail
  } catch (err) {
    throw new VError(err, '爬虫发生预期外错误')
  }
}

const crawl = async () => {
  const page = await newPage()
  try {
    await ignoreImage(page)
    const mainData = await Craw(page, url, selectorAll)
    // console.log(mainData, "maindata")
    if (mainData.numbers.length === 0) {
      throw new DrawingError(lotteryID)
    // throw new Error('DrawingError', `正在开奖中，无法获取结果。彩种: ${lotteryID}`)
    }
    const detail = await CrawDetail(page, mainData.drawUrl, detailTotal).then(data => { return data })
    const numbers = mainData.numbers
    const details = [...detail.map(item => { return { level: item.level, total_winner: item.winners } })]
    const newData = { ...mainData, numbers, detail: details, lotteryID, name, jackpot: [mainData.super_prize] }

    delete newData.drawUrl
    delete newData.super_prize
    // console.log(newData, 'result Data')
    return newData
  } finally {
    await page.close()
  }
}
// crawl()
module.exports = {
  crawl
}
