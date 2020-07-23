const log = require('../../../util/log')
const { DrawingError } = require('../../../util/error')
const { newPage, ignoreImage } = require('../../../pptr')
const { MONTH } = require('../country')

const name = 'joker'
const lotteryID = 'ru-joker'
const url = 'https://www.stoloto.ru/joker/archive'
const selector = '#content > div.data.drawings_data'
const selectorAll = '#content > div.data.drawings_data .month'
const detailTotal = '#content > div.col.prizes > div.results_table.with_bottom_shadow > div > table > tbody > tr'
const detailWaitFor = '#content > div.col.prizes > div.results_table.with_bottom_shadow > div > table'
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
      data.drawTime = `${year}${month}${day}${time}00`
      data.issue = element.querySelector('.draw').innerText
      data.drawUrl = element.querySelector('.draw a').href
      // data.other = []
      data.jackpot = []

      let numbers = [...element.querySelectorAll('#content > div.data.drawings_data > div.month > div:nth-child(2) > div > div.numbers > div.numbers_wrapper > div:nth-child(1) > span b sup')].map(item => item.innerText)
      numbers = numbers.map(item => item.trim())
      data.numbers = numbers.map(item => item.trim()).join(',')
      console.log(data.numbers, 'data number')
      data.super_prize = element.querySelector('.prize').innerText
      return data
    }
    const results = document.querySelector(selectorAll)
    return mapFunction(results)
  }, selectorAll, MONTH, lotteryID)
  log.debug({ CrawResult }, 'CrawResult')
  return CrawResult
}
const crawDetail = async (page, url, selector) => {
  await page.goto(url)
  await page.waitForSelector(detailWaitFor)

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
  return Crawdetail
}

const crawl = async () => {
  const page = await newPage()
  try {
    await ignoreImage(page)
    const mainData = await craw(page, url, selectorAll, lotteryID)
    if (mainData.numbers.length === 0) {
      throw new DrawingError(lotteryID)
    }
    const detail = await crawDetail(page, mainData.drawUrl, detailTotal, moreDetail)
    const numbers = mainData.numbers
    const details = detail[0].map(item => { return { level: item.level, total_winner: item.winners, wininrub: item.wininrub, numbersOfWinners: item.numbersOfWinners } })
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
