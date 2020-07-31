// const puppeteer = require('puppeteer')
// 朝后放

const url = 'https://www.stoloto.ru/7x49/archive'
const lotteryID = 'ru-gosloto-7-out-of-49'
const name = 'Гослото «7 из 49'

const selector = '#content > div.data.drawings_data'
const selectorAll = '#content > div.data.drawings_data .elem'
const detailTotal = '#content > div.col.prizes > div.results_table.with_bottom_shadow > div > table > tbody > tr'
const detailWaitfor = '#content > div.col.prizes > div.results_table.with_bottom_shadow > div > table'
const { newPage, ignoreImage } = require('../../../pptr')
const { DrawingError } = require('../../../util/error')
const { MONTH } = require('../country')
const VError = require('verror')
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
        let numbers = ''
        if (element.querySelector('.numbers_wrapper')) {
          numbers = element.querySelector('.numbers_wrapper').innerText.split('\n')[0]
        }
        data.numbers = numbers.split(' ').map(item => item.slice(0, item.length - 1)).join(',')
        data.super_prize = element.querySelector('.prize').innerText
        return data
      }
      const results = document.querySelector(selectorAll)
      const TotalData = mapFunction(results)
      return TotalData
    }, selectorAll, MONTH)
    // page.close()
    return CrawResult
  } catch (error) {
    throw new VError(error, '爬虫出现未预期错误')
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
        data.winners = elementList[3].textContent.replace(/\n/g, '').split('\t').join('')
        return data
      }
      const results = [...document.querySelectorAll(selector)]
      const dataList = results.map(mapFunction)
      return dataList
    }, selector)
    // page.close()
    return Crawdetail
  } catch (error) {
    throw new VError(error, '爬虫出现未预期错误')
  }
}

const crawl = async () => {
  const page = await newPage()
  try {
    await ignoreImage(page)
    const mainData = await Craw(page, url, selectorAll)
    if (mainData.numbers.length === 0) {
      throw new DrawingError(lotteryID)
    }
    const detail = await CrawDetail(page, mainData.drawUrl, detailTotal).then(data => { return data })
    // console.log(detail, 'detail')
    const numbers = mainData.numbers.split('\n')[0].trim()
    const details = detail.map(item => { return { level: item.level, total_winner: item.winners } })
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
