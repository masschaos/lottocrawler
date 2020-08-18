const name = 'Lotto'
const lotteryID = 'uk-lotto'

const { MONTH } = require('../country')
const { newPage, ignoreImage } = require('../../../pptr')
const { DrawingError } = require('../../../util/error')
const url = 'https://www.lottery.co.uk/lotto/results'

const numberSelector = '#siteContainer > div.main > div:nth-child(5) > div.paddedLight'
const dateSelector = '#siteContainer > div.main > div:nth-child(5) > div.latestHeader.lotto'
const detailUrlSelector = '#siteContainer > div.main > div:nth-child(5) > div.resultsBottom.latest > a'
const detailTableSelector = '#siteContainer > div.main > table.table.lotto.mobFormat > tbody'

const MonthOrDayProcess = (numberString) => {
  const number = parseInt(numberString).toString()
  return number.length < 2 ? '0' + number : number
}

const Craw = async (page, dataObj) => {
  const { url, numberSelector, dateSelector, detailUrlSelector } = dataObj
  // open index page
  await page.goto(url)
  await page.waitForSelector(numberSelector)

  // get time
  const dateStr = await page.$eval(dateSelector, el => el.innerText)
  const [weekday, day, month, year] = dateStr.split(' ')
  const timestring = weekday === 'Saturday' ? '194500' : '200000'
  const drawTime = `${year}${MonthOrDayProcess(MONTH[month])}${MonthOrDayProcess(day)}${timestring}`

  // get number and jackpot
  const numberStr = await page.$eval(numberSelector, el => el.innerText)
  const numberList = numberStr.split('\n')
  console.log(numberList, 'numberList')
  const jackpot = numberList.slice(-1)
  const numbers = `${numberList.slice(0, -3).join(',')}#${numberList.slice(-3, -2)}`
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
    const [name, count, prizePerWinner, prize] = line.split('\t')
    return { name, count, prizePerWinner, prize }
  })
  if (detail.slice(-1)[0].prize.length === 1) {
    throw new DrawingError(lotteryID)
  }
  return { detail, drawTime, numbers, issue: '', jackpot: jackpot, other: [] }
}

const crawl = async () => {
  const page = await newPage()
  try {
    await ignoreImage(page)
    const dataObj = { url, numberSelector, dateSelector, detailUrlSelector, detailTableSelector }
    const mainData = await Craw(page, dataObj)
    const results = { ...mainData, name, lotteryID }
    return results
  } finally {
    await page.close()
  }
}

module.exports = { crawl }
