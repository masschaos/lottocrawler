const name = 'Pick 3'
const lotteryID = 'uk-pick3'

const url = 'https://www.lottery.co.uk/pick-3/results'
const { newPage, ignoreImage } = require('../../../pptr')
const { DrawingError } = require('../../../util/error')
const { MONTH } = require('../country')
const moment = require('moment-timezone')
const tz = 'Europe/London'
const left = '#siteContainer > div.main > div:nth-child(5) > div:nth-child(1)'
const right = '#siteContainer > div.main > div:nth-child(5) > div:nth-child(2)'

const numberAndJackpotSelector = (base) => `${base} > div.padded.centred`
const timeSelector = (base) => `${base} > div.sideHeader.pick-3.flexBox > div`

const MonthOrDayProcess = (numberString) => {
  const number = parseInt(numberString).toString()
  return number.length < 2 ? '0' + number : number
}

const Craw = async (page, dataObj) => {
  const { url, numberSelector, dateSelector, timestamp } = dataObj
  // open index page
  await page.goto(url)
  await page.waitForSelector(numberSelector)

  // get time
  const dateStr = await page.$eval(dateSelector, el => el.innerText)
  const [day, month, year] = dateStr.split('\n').slice(-1)[0].split(' ')
  // console.log(day, month, year)
  const drawTime = `${year}${MonthOrDayProcess(MONTH[month])}${MonthOrDayProcess(day)}${timestamp}`
  // get number and jackpot
  const numberStr = await page.$eval(numberSelector, el => el.innerText)
  // console.log(numberStr)
  const numberList = numberStr.split('\n')[0].split(' ')
  // console.log(numberList, 'numberList')
  const jackpot = numberList.slice(-1)
  const numbers = numberList.slice(0, 3).join('|')
  if (numbers.length !== 5) {
    throw new DrawingError(lotteryID)
  }
  // console.log(jackpot, numbers)
  return { detail: [], drawTime, numbers, issue: '', jackpot: jackpot, other: [] }
}

const crawl = async () => {
  const page = await newPage()
  try {
    await ignoreImage(page)
    const endDate = moment().tz(tz)
    const hour = endDate.hours()
    const timeStamp = ['130000', '180000']
    let dataObj
    if (hour >= 13 && hour < 18) {
    // left
      const numberSelector = numberAndJackpotSelector(left)
      const dateSelector = timeSelector(left)
      dataObj = { url, numberSelector, dateSelector, timestamp: timeStamp[0] }
    } else {
    // right
      const numberSelector = numberAndJackpotSelector(right)
      const dateSelector = timeSelector(right)
      dataObj = { url, numberSelector, dateSelector, timestamp: timeStamp[1] }
    }
    const mainData = await Craw(page, dataObj)
    const results = { ...mainData, name, lotteryID }
    // console.log(results)
    return results
  } finally {
    await page.close()
  }
}

module.exports = { crawl }
