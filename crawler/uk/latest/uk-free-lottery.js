const name = 'Free Lottery'
const lotteryID = 'uk-free-lottery'

// const other = []
// const jackpot = []
// const drawTime = ''
// const issue = ''
// const number = ''
// const detail = []

const { newPage } = require('../../../pptr')
const { MONTH } = require('../country')
const VError = require('verror')
// const { MONTH } = require('../country')
// const { PuppeteerPage } = require('../pptr')

const url = 'https://www.lottery.co.uk/free-lottery/results'
const numberSelector = '#siteContainer > div.main > div:nth-child(4) > div.padded'
const dateSelector = '#siteContainer > div.main > div:nth-child(4) > div.sideHeader.free.floatLeft > span'
const issueSelector = '#siteContainer > div.main > div:nth-child(4) > div.padded > div.extra > div > strong'

// #siteContainer > div.main > div:nth-child(4) > div.padded > div:nth-child(2)

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
    console.log(dateStr)
    const [day, month, year] = dateStr.split(' ')
    const drawTime = `${year}${MonthOrDayProcess(MONTH[month.slice(0, -1)])}${MonthOrDayProcess(day)}000000`

    // get number and jackpot
    const numberStr = await page.$eval(numberSelector, el => el.innerText)
    const numberList = numberStr.split('\n')
    console.log(numberList, 'numberList')
    const jackpot = numberList[7].split(': ')[1]
    // const numbers = `${numberList.slice(0, 6).join(",")}#${numberList.slice(-3, -2)}`
    const numbers = `${numberList.slice(1, 7).join(',')}`

    // draw number
    const issue = await page.$eval(issueSelector, el => el.innerText)

    console.log(jackpot, numbers, issue)
    return { detail: [], drawTime, numbers, issue, jackpot, other: [] }
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

// (async () => {
//     const newData = await FreeWeeklyLottery()
//     console.log(newData)
// })()

// module.exports = FreeWeeklyLottery
module.exports = { crawl }
