const url = 'https://www.stoloto.ru/6x45/archive'
const lotteryID = 'ru-gosloto-6-out-of-45'
const name = 'Гослото «6 из 45'

const selector = '#content > div.data.drawings_data'
const selectorAll = '#content > div.data.drawings_data .month'
const detailTotal = '#content > div.col.prizes > div.results_table.with_bottom_shadow > div > table > tbody > tr'
const detailWaitfor = '#content > div.col.prizes > div.results_table.with_bottom_shadow > div > table'

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
        //   console.log(monthyear, 'monthyear')
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
        data.other = []
        data.jackpot = []
        //   console.log(element.querySelector('.numbers_wrapper').outerHTML)
        const numbers = element.querySelector('.numbers_wrapper').innerText
        data.numbers = numbers.split(' ').map(item => item.slice(0, item.length - 1)).join(',')
        //   console.log(element.querySelector('.prize').outerHTML)
        data.super_prize = element.querySelector('.prize').innerText
        return data
      }
      const results = document.querySelector(selectorAll)
      // console.log(results)
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
    // console.log(mainData, 'mainData')
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
