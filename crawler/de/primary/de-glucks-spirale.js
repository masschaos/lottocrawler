const { newPage } = require('../../../pptr')
const { ignoreUrls } = require('./common')
const { DrawingError } = require('../../../util/error')
const VError = require('verror')
const moment = require('moment')

const lotteryName = 'GlücksSpirale'
const lotteryID = 'de-glucks-spirale'
const url = 'https://www.lotterypost.com/game/330'
// 开奖时间为每周六19:15开奖，19:57公布于互联网，
const drawAt = '191500'

const getDrawTime = async (page) => {
  const selector = '#game > div > dl > dd:nth-child(2) > table > tbody > tr > td.draw > div.resultsDrawDate'
  const dateString = await page.$eval(selector, el => el.innerText)
  return moment.parseZone(new Date(dateString)).format('YYYYMMDD') + drawAt
}

const getNextDrawTime = async (page) => {
  const selector = '#game > div > dl > dd:nth-child(2) > table > tbody > tr > td.info > div:nth-child(1) > div > p:nth-child(2)'
  const dateString = await page.$eval(selector, el => el.innerText)
  return moment.parseZone(new Date(dateString)).format('YYYYMMDD') + drawAt
}

const getNumbers = async (page) => {
  const numberSelector = '#game > div > dl > dd:nth-child(2) > table > tbody > tr > td.draw > div.drawWrap > div.resultsRow.resultsPlain'
  let numbers = await page.$eval(numberSelector, el => el.innerText)
  const numberList = numbers.split(',')
  numbers = numberList.map(number => {
    const items = number.split(':')[1].trim().split('/')
    return items.map((item, index) => {
      item = item.padStart(index + 1, '0').padStart(7, '-')
      return item
    }).join('#')
  })
  return numbers
}

const getNextJackpot = async () => {
  return []
}

const getBreakdown = async (page, numberList) => {
  const prizeUrlSelector = '#game > div > dl > dd:nth-child(2) > table > tbody > tr > td.draw > div.drawWrap > div:nth-child(2) > a:nth-child(2)'
  const prizeUrl = await page.$eval(prizeUrlSelector, url => url.href)
  await page.goto(prizeUrl)
  const firstLineSelector = '#prizeTable > table > tbody > tr:nth-child(1) > td:nth-child(1)'
  await page.waitForFunction(
    firstLineSelector => document.querySelector(firstLineSelector).innerText.trim().length > 0,
    {},
    firstLineSelector
  )
  const prizeTrSelector = '#prizeTable > table > tbody > tr'
  let detail = await page.$$eval(prizeTrSelector, trElements => trElements.map(trElement => {
    const tds = Array.from(trElement.querySelectorAll('td'))
    return {
      name: tds[0].innerText,
      prize: tds[1].innerText.replace('Rolling Jackpot', ''),
      odds: tds[2].innerText
    }
  }))
  if (detail.length === 0) {
    throw new DrawingError(lotteryID)
  }
  detail = detail.map((item, index) => {
    item.numbers = numberList[index]
    return item
  })
  return [{
    name: 'prizes-odds',
    detail: detail
  }]
}

const getJackpot = () => {
  return []
}

const crawl = async () => {
  const page = await newPage()
  try {
    await ignoreUrls(page)
    await page.goto(url)
    const drawTimeSelecor = '#game > div > dl > dd:nth-child(2) > table > tbody > tr > td.draw > div.resultsDrawDate'
    await page.waitForSelector(drawTimeSelecor)
    const drawTime = await getDrawTime(page)
    const nextDrawTime = await getNextDrawTime(page)
    const numberList = await getNumbers(page)
    const numbers = numberList[6]
    const nextJackpot = await getNextJackpot(page)
    const breakdown = await getBreakdown(page, numberList)
    const jackpot = getJackpot(breakdown)
    const result = {
      lotteryID: lotteryID,
      name: lotteryName,
      drawTime: drawTime,
      nextDrawTime: nextDrawTime,
      numbers: numbers,
      breakdown: breakdown,
      jackpot: jackpot,
      nextJackpot: nextJackpot
    }
    return result
  } catch (err) {
    if (err.name === 'DrawingError') {
      throw err
    }
    throw new VError(`${lotteryID}没有抓到数据，可能数据源不可用或有更改，请检查调度策略。detail: ${err.name} - ${err.message}`)
  } finally {
    await page.close()
  }
}
module.exports = { crawl }
