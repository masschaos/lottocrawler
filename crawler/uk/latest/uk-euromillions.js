const name = 'EuroMillions'
const lotteryID = 'uk-euromillions'
// const other = []
// const jackpot = []
// const drawTime = ''
// const issue = ''
// const number = ''
// const detail = []

const { newPage } = require('../../../pptr')
const { MONTH } = require('../country')
const VError = require('verror')

const url = 'https://www.lottery.co.uk/euromillions/results'
const numberSelector = '#siteContainer > div.main > div:nth-child(5) > div.paddedLight'
const dateSelector = '#siteContainer > div.main > div:nth-child(5) > div.latestHeader.euromillions > span'
const detailUrlSelector = '#siteContainer > div.main > div:nth-child(5) > div.resultsBottom.latest > a'
const detailTableSelector = '#siteContainer > div.main > table.table.euromillions.mobFormat > tbody'

const MonthOrDayProcess = (numberString) => {
  const number = parseInt(numberString).toString()
  return number.length < 2 ? '0' + number : number
}

const Craw = async (dataObj) => {
  const { url, numberSelector, dateSelector, detailUrlSelector } = dataObj
  const page = await newPage()
  try {
    // open index page
    await page.goto(url)
    await page.waitForSelector(numberSelector)

    // get time
    const dateStr = await page.$eval(dateSelector, el => el.innerText)
    const [day, month, year] = dateStr.split(' ')
    const drawTime = `${year}${MonthOrDayProcess(MONTH[month])}${MonthOrDayProcess(day)}000000`
    console.log(drawTime)

    // get number and jackpot
    const numberStr = await page.$eval(numberSelector, el => el.innerText)
    const numberList = numberStr.split('\n')
    console.log(numberList, 'numberList')
    const jackpot = numberList.slice(-1)
    const numbers = `${numberList.slice(0, -4).join(',')}#${numberList.slice(-4, -2).join(',')}`
    console.log(jackpot, numbers)

    // get detail url
    const detailUrl = await page.$eval(detailUrlSelector, url => url.href)
    console.log(detailUrl, 'detailUrl')

    // open index page
    await page.goto(detailUrl)
    await page.waitForSelector(detailTableSelector)

    // get detail date
    const detailTable = await page.$eval(detailTableSelector, el => el.innerText)
    const detailLevelList = detailTable.split('\n')
    const detail = detailLevelList.map(line => {
      const [name, ukWinner, prizePerWinner, prize, count] = line.split('\t')
      return { name, count, prizePerWinner, prize, ukWinner }
    })
    return { detail, drawTime, numbers, issue: '', jackpot: jackpot, other: [] }
  } catch (error) {
    throw new VError(error, '爬虫发生预期外错误')
  } finally {
    await page.close()
  }
}

const crawl = async () => {
  const dataObj = { url, numberSelector, dateSelector, detailUrlSelector, detailTableSelector }
  const mainData = await Craw(dataObj)
  const results = { ...mainData, name, lotteryID }
  return results
}

module.exports = { crawl }
