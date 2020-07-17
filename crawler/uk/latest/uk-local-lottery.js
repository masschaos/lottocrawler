const name = 'Local Lottery'
const lotteryID = 'uk-local-lottery'

const { newPage } = require('../../../pptr')
const { MONTH } = require('../country')
const VError = require('verror')

const url = 'https://www.lottery.co.uk/local-lotto-results'
const numberSelector = '#siteContainer > div.main > div:nth-child(4) > div.padded'
const dateSelector = '#siteContainer > div.main > div:nth-child(4) > div.sideHeader.local.floatLeft > span'

const MonthOrDayProcess = (numberString) => {
  const number = parseInt(numberString).toString()
  return number.length < 2 ? '0' + number : number
}

const Craw = async (dataObj) => {
  const { url, numberSelector, dateSelector } = dataObj
  const page = await newPage()
  try {
    // open index page
    await page.goto(url)
    await page.waitForSelector(numberSelector)

    // get time
    const dateStr = await page.$eval(dateSelector, el => el.innerText)
    let [day, month, year] = dateStr.split(' ')
    month = month.slice(0, -1)
    const drawTime = `${year}${MonthOrDayProcess(MONTH[month])}${MonthOrDayProcess(day)}000000`
    console.log(drawTime)

    // get number and jackpot
    const numberStr = await page.$eval(numberSelector, el => el.innerText)
    const numberList = numberStr.split('\n')
    console.log(numberList, 'numberList')
    const jackpot = [numberList.slice(-3, -2)[0].split(': ')[1]]
    const numbers = `${numberList.slice(0, 6).join('|')}`
    return { detail: [], drawTime, numbers, issue: '', jackpot, other: [] }
  } catch (error) {
    throw new VError(error, '爬虫发生预期外错误')
  } finally {
    await page.close()
  }
}

const crawl = async () => {
  const dataObj = { url, numberSelector, dateSelector }
  const mainData = await Craw(dataObj)
  const results = { ...mainData, name, lotteryID }
  return results
}

module.exports = { crawl }
