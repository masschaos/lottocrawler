const log = require('../../../util/log')

const url = 'https://www.stoloto.ru/5x36plus/archive'
// const selector = '#content > div.data.drawings_data'
// const selectorAll = '#content > div.data.drawings_data .elem'
// const detailTotal = '#content > div.col.prizes > div.results_table.with_bottom_shadow > div > table > tbody > tr'
// const detailWaitfor = '#content > div.col.prizes > div.results_table.with_bottom_shadow > div > table'
const lotteryID = 'ru-5-out-of-36'
const name = '5 из 36'

const selector = '#content > div.data.drawings_data'

const selectorAll = '#content > div.data.drawings_data .elem'
const detailTotal = '#content > div.col.prizes > div.results_table.with_bottom_shadow > div > table > tbody > tr'
const detailWaitfor = '#content > div.col.prizes > div.results_table.with_bottom_shadow > div > table'

const moreDetail = '#content > div.col.drawing_details > div > div > table > tbody > tr'
const { newPage, ignoreImage } = require('../../../pptr')

const { DrawingError } = require('../../../util/error')
const { MONTH } = require('../country')
const Craw = async (page, url, selectorAll, lotteryID) => {
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
      data.jackpot = []
      const numbersResult = element.querySelector('.numbers_wrapper .container')
      let numbers = (numbersResult && numbersResult.innerText) || ''
      numbers = numbers.length ? numbers.split(' ') : []
      const number = numbers.map(item => item.trim())
      data.numbers = `${number.slice(0, 5).join(',')}|${number.slice(-1).join(',')}`
      const [superPrize, prize] = element.querySelector('.prize').innerText.split('\n')
      data.super_prize = superPrize
      data.prize = prize
      return data
    }
    const results = document.querySelector(selectorAll)
    // log.debug(results)
    const TotalData = mapFunction(results)
    return TotalData
  }, selectorAll, MONTH, lotteryID)
  //   page.close()
  // log.debug(CrawResult, 'CrawResult')
  return CrawResult
}
const CrawDetail = async (page, url, selector) => {
  await page.goto(url)
  await page.waitForSelector(detailWaitfor)

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
  //   page.close()
  return Crawdetail
}

const crawl = async () => {
  const page = await newPage()
  try {
    await ignoreImage(page)
    const mainData = await Craw(page, url, selectorAll, lotteryID)
    if (mainData.numbers.length === 1) {
      throw new DrawingError(lotteryID)
    }
    log.debug(mainData.drawUrl, lotteryID)
    const detail = await CrawDetail(page, mainData.drawUrl, detailTotal, moreDetail)
    const numbers = mainData.numbers
    const details = detail[0].map(item => { return { level: item.level, total_winner: item.winners, wininrub: item.wininrub, numbersOfWinners: item.numbersOfWinners } })
    const newData = { ...mainData, numbers, detail: details, lotteryID, name, jackpot: [mainData.super_prize] }
    newData.other = detail[1]
    delete newData.drawUrl
    delete newData.super_prize
    return newData
  } finally {
    await page.close()
  }
}
module.exports = {
  crawl
}
