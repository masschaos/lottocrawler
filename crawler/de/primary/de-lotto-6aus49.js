const { newPage } = require('../../../pptr')
const { ignoreUrls } = require('./common')
const { DrawingError } = require('../../../util/error')
const VError = require('verror')
const moment = require('moment')

const lotteryName = 'Lotto 6aus49'
const lotteryID = 'de-lotto-6aus49'
const url = 'https://www.lotterypost.com/game/325'

const getDrawTime = async (page) => {
  const selector = '#game > div > dl > dd:nth-child(2) > table > tbody > tr > td.draw > div.resultsDrawDate'
  const dateString = await page.$eval(selector, el => el.innerText)
  return moment.parseZone(new Date(dateString)).format('YYYYMMDDHHmmss')
}

const getNextDrawTime = async (page) => {
  const selector = '#game > div > dl > dd:nth-child(2) > table > tbody > tr > td.info > div:nth-child(1) > div > p:nth-child(2)'
  const dateString = await page.$eval(selector, el => el.innerText)
  return moment.parseZone(new Date(dateString)).format('YYYYMMDDHHmmss')
}

const getNumbers = async (page) => {
  const numberSelector = '#game > div > dl > dd:nth-child(2) > table > tbody > tr > td.draw > div.drawWrap > div:nth-child(1) > ul > li'
  const superzahlSelector = '#game > div > dl > dd:nth-child(2) > table > tbody > tr > td.draw > div.drawWrap > div:nth-child(2) > ul > li'
  const numbers = await page.$$eval(numberSelector, elements => elements.map(element => {
    return element.innerText
  }))
  const superzahlNumbers = await page.$$eval(superzahlSelector, elements => elements.map(element => {
    return element.innerText
  }))
  return [numbers.join(','), superzahlNumbers.join(',')].join('#')
}

const getNextJackpot = async (page) => {
  const selector = '#game > div > dl > dd:nth-child(2) > table > tbody > tr > td.info > div:nth-child(2) > div:nth-child(1) > p > span'
  const pendingSelector = '#game > div > dl > dd:nth-child(2) > table > tbody > tr > td.info > div:nth-child(2) > div > p > em'
  try {
    const nextJackpot = await page.$eval(selector, el => el.innerText)
    return nextJackpot.split('\n').slice(0, 1)
  } catch {
    await page.$eval(pendingSelector, el => el.innerText)
    throw new DrawingError(lotteryID)
  }
}

const getBreakdown = async (page) => {
  const prizeUrlSelector = '#game > div > dl > dd:nth-child(2) > table > tbody > tr > td.draw > div.drawWrap > div:nth-child(3) > a:nth-child(2)'
  const prizeUrl = await page.$eval(prizeUrlSelector, url => url.href)
  await page.goto(prizeUrl)
  const firstLineSelector = '#prizeTable > table > tbody > tr:nth-child(1) > td:nth-child(1)'
  await page.waitForFunction(
    firstLineSelector => document.querySelector(firstLineSelector).innerText.trim().length > 0,
    {},
    firstLineSelector
  )
  const prizeTrSelector = '#prizeTable > table > tbody > tr'
  const detail = await page.$$eval(prizeTrSelector, trElements => trElements.map(trElement => {
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
  return [{
    name: 'prizes-odds',
    detail: detail
  }]
}

const getJackpot = (breakdown) => {
  return [breakdown[0].detail[0].prize]
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
    const numbers = await getNumbers(page)
    const nextJackpot = await getNextJackpot(page)
    const breakdown = await getBreakdown(page)
    const jackpot = getJackpot(breakdown)
    const result = {
      lotteryID: lotteryID,
      name: lotteryName,
      drawtime: drawTime,
      nextDrawtime: nextDrawTime,
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
