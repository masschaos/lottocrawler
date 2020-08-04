const log = require('../../../util/log')
const { DrawingError } = require('../../../util/error')
const { newPage, ignoreImage } = require('../../../pptr')
const { MONTH } = require('../country')

const name = 'КЕНО-Спортлото'
const lotteryID = 'ru-keno'
const url = 'https://www.stoloto.ru/keno/archive'
const selector = '#content > div.data.drawings_data'
const selectorAll = '#content > div.data.drawings_data .elem'
const detailTotal = '#content > div.col.prizes > div.results_table.with_bottom_shadow > div > table > tbody > tr'
const detailWaitfor = '#content > div.col.prizes > div.results_table.with_bottom_shadow > div > table'

const moreDetail = '#content > div.col.drawing_details > div > div > table > tbody > tr'

const craw = async (page, url, selectorAll, lotteryID) => {
  await page.goto(url)
  await page.waitForSelector(selector)
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
      const tmp1 = element.querySelector('.numbers_wrapper .container')
      const tmp2 = element.querySelector('.sub')
      let numberOne = []
      let numberTwo = []
      if (tmp1 && tmp2) {
        numberOne = [...tmp1.querySelectorAll('.zone > b')].map(item => item.innerText)
        numberTwo = [...tmp2.querySelectorAll('.zone > b')].map(item => item.innerText)
        numberOne = numberOne.map(item => item.trim())
        numberTwo = numberTwo.map(item => item.trim()).slice(1, numberTwo.length)
      }
      data.numbers = [numberOne.join(','), numberTwo.join(',')].join('|')
      data.super_prize = element.querySelector('.prize').innerText
      return data
    }
    const results = document.querySelector(selectorAll)
    // console.log(results)
    const TotalData = mapFunction(results)
    return TotalData
  }, selectorAll, MONTH, lotteryID)
  // page.close()
  // console.log(CrawResult, 'CrawResult')
  return CrawResult
}
const CrawDetail = async (page, url, selector, moreDetail) => {
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
  // page.close()
  return Crawdetail
}

const crawl = async () => {
  const page = await newPage()
  try {
    await ignoreImage(page)
    const mainData = await craw(page, url, selectorAll, lotteryID)
    if (mainData.numbers.length === 1) {
      throw new DrawingError(lotteryID)
    }
    const detail = await CrawDetail(page, mainData.drawUrl, detailTotal, moreDetail).then(data => { return data })
    const numbers = mainData.numbers
    const details = [{ twoDimensionalList: detail[0].map(item => { return { value: item } }) }]
    const newData = { ...mainData, numbers, detail: details, lotteryID, name, jackpot: [mainData.super_prize] }
    newData.other = detail[1]
    delete newData.drawUrl
    delete newData.super_prize
    log.debug({ newData }, 'newData')
    return newData
  } finally {
    await page.close()
  }
}

module.exports = {
  crawl
}
