// const puppeteer = require('puppeteer')

const url = 'https://www.stoloto.ru/ruslotto2/archive'

const selector = '#content > div.data.drawings_data'
const selectorAll = '#content > div.data.drawings_data .month'
const detailTotal = '#content > div.results_table > table.data > tbody > tr'
const detailWaitfor = '#content > div.results_table'
const lotteryID = 'ru-russian-lotto2'
const name = 'Русского лото экспресс'

const { MONTH } = require('../country')

const { DrawingError } = require('../../../util/error')
const { newPage, ignoreImage } = require('../../../pptr')

const craw = async (page, url, selectorAll) => {
  await page.goto(url)
  await page.waitForSelector(selector)
  const CrawResult = await page.evaluate((selectorAll, MONTH) => {
    const mapFunction = (element) => {
      const data = {}
      const monthyear = element.querySelector('.date').innerText
      let [month, year] = monthyear.split(', ')
      const drawDate = element.querySelector('.draw_date').innerText
      let day = drawDate.split(' ')[0]
      day = day.length < 2 ? '0' + day : day
      month = MONTH[month].toString().length < 2 ? '0' + MONTH[month] : MONTH[month]
      // 对drawDate做处理。
      data.drawTime = `${year}${month}${day}210000`
      data.issue = element.querySelector('.draw').innerText
      data.drawUrl = element.querySelector('.draw a').href
      data.other = []
      data.jackpot = []
      //   log.debug(element.querySelector('.numbers_wrapper').outerHTML)
      let numbers = ''
      if (element.querySelector('.elem').querySelector('.numbers_wrapper')) {
        numbers = element.querySelector('.elem .numbers_wrapper').innerText
      }
      numbers = numbers.split(' ').join(',')
      data.numbers = numbers
      //   log.debug(element.querySelector('.prize').outerHTML)
      data.super_prize = element.querySelector('.super_prize').innerText
      return data
    }
    const results = document.querySelector(selectorAll)
    // log.debug(results)
    const TotalData = mapFunction(results)
    return TotalData
  }, selectorAll, MONTH)
  // page.close()
  return CrawResult
}

const CrawDetail = async (page, url, selector) => {
  await page.goto(url)
  await page.waitForSelector(detailWaitfor)
  const Crawdetail = await page.evaluate((selector) => {
    const mapFunction = (element) => {
      const data = {}
      const elementList = [...element.querySelectorAll('td')]
      //   log.debug(elementList[0].outerHTML, 'elementList')
      data.level = elementList[0].textContent
      let number = elementList[1].textContent.split('\n').join(',').split('\t').join('')
      //   log.debug(number, 'number')
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
      data.number = number
      //   data.winner = elementList[2].textContent
      //   log.debug(elementList[3].textContent)
      data.prize = elementList[3].textContent.replace('\n', '').split('\t').join('').replace('\n', '')
      return data
    }
    const results = [...document.querySelectorAll(selector)]
    const dataList = results.map(mapFunction)
    return dataList
  }, selector)
  // page.close()
  return Crawdetail
}

const crawl = async () => {
  const page = await newPage()
  try {
    await ignoreImage(page)
    const mainData = await craw(page, url, selectorAll)
    if (mainData.numbers.length === 0) {
      throw new DrawingError(lotteryID)
    }
    // log.debug(mainData, 'mainData')
    const detail = await CrawDetail(page, mainData.drawUrl, detailTotal).then(data => { return data })
    // log.debug(detail, 'detail')
    const numbers = [mainData.numbers, ...detail.map(item => item.number)].join('#')
    const details = [{ level: '0', prize: mainData.super_prize, number: mainData.numbers }, ...detail.map(item => { return { level: item.level, prize: item.prize, number: item.number } })]
    const newData = { ...mainData, numbers, detail: details, lotteryID, name }
    delete newData.drawUrl
    delete newData.super_prize
    // log.debug(newData)
    return newData
  } finally {
    await page.close()
  }
}
// crawl()
module.exports = {
  crawl
}
