const name = 'Local Lottery'
const lotteryID = 'uk-local-lottery'
// const other = []
// const jackpot = []
// const drawTime = ''
// const issue = ''
// const number = ''
// const detail = []

// const { MONTH, MonthOrDayProcess, monthCheck, dayCheck } = require('../country')
// const { PuppeteerPage, writeJsonToFile } = require('../pptr')
const { MONTH, MonthOrDayProcess, monthCheck, dayCheck, writeJsonToFile } = require('../country')
const { newPage } = require('../../../pptr')
const VError = require('verror')

const [startYear, endYear] = [2020, 1994]
const historyNumberPageSelector = '#siteContainer > div.main > table > tbody tr'
const historyDetailUrlSelector = '#siteContainer > div.main > table > tbody td a'
// const detailTableSelector = '#siteContainer > div.main > table.table.lotto.mobFormat > tbody'

const getHistory = async (startYear, endYear, lotteryID) => {
  const HISTORY = []
  try {
    console.log(startYear, endYear)
    for (let year = startYear; year > endYear; year--) {
      const page = await newPage()
      await page.exposeFunction('MonthOrDayProcess', MonthOrDayProcess)
      await page.exposeFunction('monthCheck', monthCheck)
      await page.exposeFunction('dayCheck', dayCheck)
      // https://www.lottery.co.uk/local-lotto-results
      const url = `https://www.lottery.co.uk/lotto/results/archive-${year}`
      await page.goto(url)
      await page.waitForSelector(historyNumberPageSelector)
      // get detail URL
      const DetailUrlList = await page.$$eval(historyDetailUrlSelector, el => {
        return el.map(item => {
          return item.href
        })
      })

      // get Date Number jackpot
      const dateStr = await page.$$eval(historyNumberPageSelector, (el, MONTH) => {
        return Promise.all(el.map(async item => {
          const [dateString, numberString, jackpotString] = item.innerText.split('\t')
          let [weekday, day, month, year] = dateString.split(' ')
          month = await MonthOrDayProcess(MONTH[month])
          day = await MonthOrDayProcess(day)
          if (monthCheck(month) && dayCheck(day)) {
            const drawTime = `${year}${month}${day}000000`
            const numbersList = numberString.split(' ')
            const numbers = `${numbersList.slice(0, -1).join(',')}#${numbersList.slice(-1).join(',')}`
            const jackpot = jackpotString.split('\n')[0]
            return { drawTime, numbers, jackpot: [jackpot] }
          } else {
            return { error: 'error' }
          }
        }))
      }, MONTH)
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
