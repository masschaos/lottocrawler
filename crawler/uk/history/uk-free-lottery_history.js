const name = 'Free Lottery'
const lotteryID = 'uk-free-lottery'
// const other = []
// const jackpot = []
// const drawTime = ''
// const issue = ''
// const number = ''
// const detail = []

// const { MONTH, MonthOrDayProcess } = require('../country')
// const { PuppeteerPage, writeJsonToFile } = require('../pptr')
const { MONTH, MonthOrDayProcess, writeJsonToFile } = require('../country')
const { newPage } = require('../../../pptr')
const VError = require('verror')

const [startYear, endYear] = [2020, 1994]
const historyNumberPageSelector = '#siteContainer > div.main > table > tbody tr'
const historyDetailUrlSelector = '#siteContainer > div.main > table > tbody td a'
// const detailTableSelector = '#siteContainer > div.main > table.table.euromillions.mobFormat > tbody'

const getHistory = async (startYear, endYear, lotteryID) => {
  const HISTORY = []
  try {
    console.log(startYear, endYear)
    for (let year = startYear; year > endYear; year--) {
      const page = await newPage()
      await page.exposeFunction('MonthOrDayProcess', MonthOrDayProcess)
      const url = `https://www.lottery.co.uk/free-lottery/results/archive-${year}`
      await page.goto(url)
      await page.waitForSelector(historyNumberPageSelector)

      // get Date Number jackpot
      const dateStr = await page.$$eval(historyNumberPageSelector, (el, MONTH, lotteryID, name) => {
        return Promise.all(el.map(async item => {
          const [dateString, DrawType, numberString, jackpotString] = item.innerText.split('\t')
          console.log(dateString)
          console.log(DrawType)
          console.log(numberString)
          console.log(jackpotString)
          let [weekday, day, month, year] = dateString.split(' ')
          month = await MonthOrDayProcess(MONTH[month])
          day = await MonthOrDayProcess(day)
          const drawTime = `${year}${month}${day}000000`
          const numbersList = numberString.split(' ')
          const numbers = numbersList.join(',')
          const jackpot = jackpotString.split('\n')[0]
          return { drawTime, numbers, jackpot: [jackpot], detail: [], other: [], name, lotteryID, issue: '', DrawType }
        }))
      }, MONTH, lotteryID, name)
      for (let i = 0; i < dateStr.length; i++) {
        HISTORY.push(dateStr[i])
      }
      await page.close()
    }
  } catch (err) {
    throw new VError(err, '爬虫发生预期外错误')
  } finally {
    console.log('write to file')
    writeJsonToFile(lotteryID, HISTORY)
  }
}

// (async () => {
//     const newData = await getHistory(startYear, endYear, lotteryID)
// })()
