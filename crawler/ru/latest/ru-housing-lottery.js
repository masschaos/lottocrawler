// const puppeteer = require('puppeteer')
// 朝后放

const url = 'https://www.stoloto.ru/gzhl/archive'

const selector = '#content > div.data.drawings_data'
const selectorAll = '#content > div.data.drawings_data .month'
const detailTotal = '#content > div.col.drawing_results > div > table > tbody > tr'
const detailWaitfor = '#content > div.col.drawing_results > div > table'
const lotteryID = 'ru-housing-lottery'
const name = 'Жилищной лотереи'

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
        let numbers = element.querySelector('.numbers_wrapper').innerText
        numbers = numbers.split(' ').join(',')
        data.numbers = numbers
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
  await page.goto(url)
  await page.waitForSelector(detailWaitfor)
  try {
    const Crawdetail = await page.evaluate((selector) => {
      const mapFunction = (element) => {
        const data = {}
        const elementList = [...element.querySelectorAll('td')]
        data.level = elementList[0].textContent
        let number = elementList[1].textContent.split('\n').join(',').split('\t').join('')
        if (number[0] === ',') {
          number = number.slice(1, number.length)
        }
        if (number[number.length - 1] === ',') {
          number = number.slice(0, number.length - 1)
        }
        if (number === 'Кубышка') {
          data.level = '-1'
          number = ''
        }
        number = number.replace(/ /g, '')
        data.number = number
        data.prize = elementList[3].textContent.replace(/\n/g, '').split('\t').join('')
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
    //   console.log(mainData, 'mainData')
    const detail = await CrawDetail(page, mainData.drawUrl, detailTotal).then(data => { return data })
    const numbers = [mainData.numbers, ...detail.map(item => item.number)].join('#')
    const details = [{ level: '0', prize: mainData.super_prize, number: mainData.numbers }, ...detail.map(item => { return { level: item.level, prize: item.prize, number: item.number } })]
    const newData = { ...mainData, numbers, detail: details, lotteryID, name }
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
