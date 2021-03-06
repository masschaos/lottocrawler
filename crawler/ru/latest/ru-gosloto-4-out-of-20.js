// const puppeteer = require('puppeteer')

const url = 'https://www.stoloto.ru/4x20/archive'
const selector = '#content > div.data.drawings_data'
const selectorAll = '#content > div.data.drawings_data .elem'
const detailTotal = '#content > div.col.prizes > div.results_table.with_bottom_shadow > div > table > tbody > tr'
const detailWaitfor = '#content > div.col.prizes > div.results_table.with_bottom_shadow > div > table'
const lotteryID = 'ru-gosloto-4-out-of-20'
const name = 'Гослото «4 из 20'

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
        //   const monthyear = element.querySelector('.date').innerText
        //   log.debug(monthyear, 'monthyear')
        //   let [month, year] = monthyear.split(', ')
        const drawDate = element.querySelector('.draw_date').innerText
        const [yearPro, dayPro] = drawDate.split(' ')
        const time = dayPro.split(':').join('')
        const [day, month, year] = yearPro.split('.')
        //   month = MONTH[month].toString().length < 2 ? '0' + MONTH[month] : MONTH[month]
        // 对drawDate做处理。
        data.drawTime = `${year}${month}${day}${time}00`
        data.issue = element.querySelector('.draw').innerText
        data.drawUrl = element.querySelector('.draw a').href
        // log.debug(data.drawUrl, 'url')
        data.other = []
        data.jackpot = []
        //   log.debug(element.querySelector('.numbers_wrapper').outerHTML)
        let numbers = ''
        if (element.querySelector('.numbers_wrapper')) {
          numbers = element.querySelector('.numbers_wrapper').innerText.split('\n')[0].trim()
        }
        const tmp = numbers.split(' ')
        numbers = [tmp.slice(0, tmp.length - 4).join(','), tmp.slice(tmp.length - 4, tmp.length)].join('|')
        data.numbers = numbers
        //   log.debug(element.querySelector('.prize').outerHTML)
        data.super_prize = element.querySelector('.prize').innerText
        return data
      }
      const results = document.querySelector(selectorAll)
      // log.debug(results)
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
        //   log.debug(elementList[0].outerHTML, 'elementList')
        data.level = elementList[0].textContent
        data.winners = elementList[4].textContent.replace(/\n/g, '').split('\t').join('')
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
    if (mainData.numbers.length === 1) {
      throw new DrawingError(lotteryID)
    }
    // log.debug(mainData, 'mainData')
    const detail = await CrawDetail(page, mainData.drawUrl, detailTotal).then(data => { return data })
    // log.debug(detail, 'detail')
    const numbers = mainData.numbers
    const details = [...detail.map(item => { return { level: item.level, total_winner: item.winners } })]
    const newData = { ...mainData, numbers, detail: details, lotteryID, name, jackpot: [mainData.super_prize] }
    delete newData.drawUrl
    delete newData.super_prize
    // log.debug(newData, 'result Data')
    return newData
  } finally {
    await page.close()
  }
}
// crawl()
module.exports = {
  crawl
}
