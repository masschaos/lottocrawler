const name = 'Free Lottery'
const lotteryID = 'uk-free-lottery'

const { MONTH } = require('../country')
const VError = require('verror')
const { newPage, ignoreImage } = require('../../../pptr')
const { DrawingError } = require('../../../util/error')
const moment = require('moment-timezone')
const tz = 'Europe/London'
const url = 'https://www.lottery.co.uk/free-lottery/results'
// const tz = 'America/New_York'
// 14:00 <= time <19:30   19:30 <= time <=23:59:59

const MonthOrDayProcess = (numberString) => {
  const number = parseInt(numberString).toString()
  return number.length < 2 ? '0' + number : number
}

const Craw1 = async (page, dataObj) => {
  // crawWeek()
  const { url, numberSelector, dateSelector, issueSelector } = dataObj
  // open index page
  await page.goto(url)
  await page.waitForSelector(numberSelector)

  // get time
  const dateStr = await page.$eval(dateSelector, el => el.innerText)
  // console.log(dateStr)
  let [day, month, year] = dateStr.split(' ')
  month = month.trim().replace(',', '')
  const drawTime = `${year}${MonthOrDayProcess(MONTH[month])}${MonthOrDayProcess(day)}140000`

  // get number and jackpot
  const numberStr = await page.$eval(numberSelector, el => el.innerText)
  const numberList = numberStr.split('\n')
  console.log(numberList, 'numberList')
  const jackpot = numberList.slice(-1)
  // const numbers = `${numberList.slice(0, 6).join(",")}#${numberList.slice(-3, -2)}`
  const numbers = `${numberList.slice(0, 6).join(',')}`

  // draw number
  const issue = await page.$eval(issueSelector, el => el.innerText)

  console.log(jackpot, numbers, issue)
  return { detail: [], drawTime, numbers, issue, jackpot, other: [{ type: 'week' }] }
}

const Craw2 = async (page, dataObj) => {
  const { url, numberSelector, dateSelector, issueSelector, jackpotSelector } = dataObj
  // open index page
  await page.goto(url)
  await page.waitForSelector(numberSelector)

  // get time
  const dateStr = await page.$eval(dateSelector, el => el.innerText)
  let [day, month, year] = dateStr.split(' ')
  month = month.trim().replace(',', '')
  // console.log(month)
  const drawTime = `${year}${MonthOrDayProcess(MONTH[month])}${MonthOrDayProcess(day)}193000`

  // get number and jackpot
  const numberStr = await page.$eval(numberSelector, el => el.innerText)
  const numberList = numberStr.split('\n')
  const jackpot = await page.$eval(jackpotSelector, el => el.innerText)
  const numbers = `${numberList.slice(1, 7).join(',')}`

  // draw number
  const issue = await page.$eval(issueSelector, el => el.innerText)

  // console.log(jackpot, numbers, issue)
  return { detail: [], drawTime, numbers, issue, jackpot: [jackpot], other: [{ type: 'day' }] }
}

const crawl = async () => {
  const page = await newPage()
  try {
    await ignoreImage(page)
    const endDate = moment().tz(tz)
    const [hour, minute] = [endDate.hours(), endDate.minutes()]
    // const [hour, minute] = [20, 20]

    if ((hour >= 14 && hour < 19) || (hour === 19 && minute < 30)) {
    // crawWeek()

      const numberSelector = '#siteContainer > div.main .resultBox div.paddedLight'
      const dateSelector = '#siteContainer > div.main .resultBox .latestHeader span'
      const issueSelector = '#siteContainer > div.main .resultBox div.resultsBottom.latest > span.draw-no > strong'

      const dataObj = { url, numberSelector, dateSelector, issueSelector }
      const mainData = await Craw1(page, dataObj)
      const results = { ...mainData, name, lotteryID }
      console.log(results, 'results')
      return results
    } else if ((hour === 19 && minute >= 30) || (hour > 19 && hour < 24)) {
    // crawDay()

      const numberSelector = '#siteContainer > div.main .resultBox.withSide.lottoResults > div.padded'
      const dateSelector = '#siteContainer > div.main .resultBox.withSide.lottoResults > div.sideHeader.free.floatLeft > span'
      const issueSelector = '#siteContainer > div.main .resultBox.withSide.lottoResults > div.padded > div.extra > div > strong'
      const jackpotSelector = '#siteContainer > div.main .resultBox.withSide.lottoResults > div.padded > div.floatRight.centred.padded > span'
      const dataObj = { url, numberSelector, dateSelector, issueSelector, jackpotSelector }
      const mainData = await Craw2(page, dataObj)
      const results = { ...mainData, name, lotteryID }
      console.log(results, 'results')
      return results
    } else {
      throw new Error('非调度时间不可执行爬虫')
    }
  } finally {
    await page.close()
  }
}

// crawl()
module.exports = { crawl }
