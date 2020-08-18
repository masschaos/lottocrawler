// const puppeteer = require('puppeteer')

const url = 'https://www.stoloto.ru/ruslotto/archive'

const selector = '#content > div.data.drawings_data'
const selectorAll = '#content > div.data.drawings_data .month'
const detailTotal = '#content > div.results_table > table.data > tbody > tr'
const detailWaitfor = '#content > div.results_table > table.data > tbody'

const lotteryID = 'ru-russian-lotto'
const name = 'Русское лото'
const { DrawingError } = require('../../../util/error')

const { MONTH } = require('../country')

const { newPage, ignoreImage } = require('../../../pptr')

const Craw = async (page, url, selectorAll) => {
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
      data.drawTime = `${year}${month}${day}082000`
      data.issue = element.querySelector('.draw').innerText
      data.drawUrl = element.querySelector('.draw a').href
      data.other = []
      data.jackpot = []
      //   console.log(element.querySelector('.numbers_wrapper').outerHTML)
      let numbers = ''
      if (element.querySelector('.elem').querySelector('.numbers_wrapper')) {
        numbers = element.querySelector('.elem .numbers_wrapper').innerText
      }
      // let numbers = element.querySelector('.numbers_wrapper').innerText
      // console.log(numbers, 'numbers')
      numbers = numbers.split(' ').join(',')
      data.numbers = numbers
      data.super_prize = element.querySelector('.super_prize').innerText
      // console.log(element.querySelector('.prize').outerHTML)
      return data
    }
    const results = document.querySelector(selectorAll)
    // console.log(results)
    const TotalData = mapFunction(results)
    return TotalData
  }, selectorAll, MONTH)
  return CrawResult
}

const CrawDetail = async (page, url, selector) => {
  await page.goto(url)
  await page.waitForSelector(detailWaitfor)

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
      data.number = number
      //   data.winner = elementList[2].textContent
      //   console.log(elementList[3].textContent)
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
    const mainData = await Craw(page, url, selectorAll)
    if (mainData.numbers.length === 0) {
      throw new DrawingError(lotteryID)
    }
    // console.log(mainData)
    const detail = await CrawDetail(page, mainData.drawUrl, detailTotal).then(data => { return data })
    console.log(detail)
    const numbers = [mainData.numbers, ...detail.map(item => item.number)].join('#')
    const details = [{ level: '0', prize: mainData.super_prize, number: mainData.numbers }, ...detail.map(item => { return { level: item.level, prize: item.prize, number: item.number } })]
    const newData = { ...mainData, numbers, detail: details, lotteryID, name }
    delete newData.drawUrl
    delete newData.super_prize
    console.log(newData)
    return newData
  } finally {
    await page.close()
  }
}
// crawl()
module.exports = {
  crawl
}
