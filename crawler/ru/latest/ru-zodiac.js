const log = require('../../../util/log')
const { DrawingError } = require('../../../util/error')
const { newPage, ignoreImage } = require('../../../pptr')
const { MONTH } = require('../country')

const url = 'https://www.stoloto.ru/zodiac/archive'
const selector = '#content > div.data.drawings_data'
const selectorAll = '#content > div.data.drawings_data .month'
const detailTotal = '#content > div.col.prizes > div.results_table.with_bottom_shadow > div > table > tbody > tr'
const detailWaitfor = '#content > div.col.prizes > div.results_table.with_bottom_shadow > div > table'
const lotteryID = 'ru-zodiac'
const name = 'Зодиак'

const craw = async (page, url, selectorAll) => {
  await page.goto(url)
  await page.waitForSelector(selector)
  const CrawResult = await page.evaluate((selectorAll, MONTH) => {
    const mapFunction = (element) => {
      const data = {}
      const star = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓']
      const drawDate = element.querySelector('.draw_date').innerText
      const [yearPro, dayPro] = drawDate.split(' ')
      const time = dayPro.split(':').join('')
      const [day, month, year] = yearPro.split('.')
      data.drawTime = `${year}${month}${day}${time}00`
      data.issue = element.querySelector('.draw').innerText
      data.drawUrl = element.querySelector('.draw a').href
      data.other = []
      data.jackpot = []
      const numbers = element.querySelector('.numbers_wrapper').innerText.split(' ')
      // console.log(star, "star")
      const three = numbers.slice(0, -1)
      const last = numbers.slice(-1)

      data.numbers = [...three, star[parseInt(last) - 1] + numbers.slice(3)].join('|')
      data.super_prize = element.querySelector('.prize').innerText
      return data
    }
    const results = document.querySelector(selectorAll)
    // console.log(results)
    const TotalData = mapFunction(results)
    return TotalData
  }, selectorAll, MONTH)
  // page.close()
  log.debug({ CrawResult }, 'CrawResult')
  return CrawResult
}

const crawDetail = async (page, url, selector) => {
  await page.goto(url)
  await page.waitForSelector(detailWaitfor)
  const crawdetail = await page.evaluate((selector) => {
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
  return crawdetail
}

const crawl = async () => {
  const page = await newPage()
  try {
    await ignoreImage(page)
    const mainData = await craw(page, url, selectorAll)
    log.debug({ mainData }, 'mainData')
    if (mainData.numbers.length === 1) {
      throw new DrawingError(lotteryID)
    }
    // console.log(mainData.drawUrl, 'drawUrl')
    const detail = await crawDetail(page, mainData.drawUrl, detailTotal)
    // console.log(mainData.numbers, 'number')
    const numbers = mainData.numbers.split('\n')[1]
    const details = detail.map(item => { return { level: item.level, total_winner: item.winners } })
    const newData = { ...mainData, numbers, detail: details, lotteryID, name, jackpot: [mainData.super_prize] }
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
