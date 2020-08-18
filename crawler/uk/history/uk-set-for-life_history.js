const { MONTH, MonthOrDayProcess /* monthCheck, dayCheck */, writeJsonToFile } = require('../country')
const { newPage } = require('../../../pptr')
const VError = require('verror')

const name = 'Set For Life'
const lotteryID = 'uk-set-for-life'

// const { MONTH, MonthOrDayProcess, monthCheck, dayCheck } = require('../country')
// const { PuppeteerPage, writeJsonToFile } = require('../pptr')
const [startYear, endYear] = [2020, 1994]
const historyNumberPageSelector = '#siteContainer > div.main > table > tbody tr'
const historyDetailUrlSelector = '#siteContainer > div.main > table > tbody td a'
const detailTableSelector = '#siteContainer > div.main > table.table.setForLife.mobFormat > tbody'
// #siteContainer > div.main > div:nth-child(5) > div.resultsBottom.latest > a

const getHistory = async (startYear, endYear, lotteryID) => {
  const HISTORY = []
  try {
    console.log(startYear, endYear)
    for (let year = startYear; year > endYear; year--) {
      const page = await newPage()
      await page.exposeFunction('MonthOrDayProcess', MonthOrDayProcess)
      const url = `https://www.lottery.co.uk/set-for-life/results/archive-${year}`
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
          let [dateString, numberString, WinnerString] = item.innerText.split('\t')
          // eslint-disable-next-line
          let [weekday, day, month, year] = dateString.split('\n').join(' ').split(' ')
          month = await MonthOrDayProcess(MONTH[month])
          day = await MonthOrDayProcess(day)
          const drawTime = `${year}${month}${day}000000`
          const numbersList = numberString.split(' ')
          const numbers = `${numbersList.slice(0, -1).join(',')}#${numbersList.slice(-1).join(',')}`
          WinnerString = WinnerString.split('\n')[0]
          return { drawTime, numbers, jackpot: [], count: WinnerString }
        }))
      }, MONTH)
      await page.close()

      for (let urlIndex = 0; urlIndex < DetailUrlList.length; urlIndex++) {
        const page = await newPage()
        console.log(`==------go to page ${DetailUrlList[urlIndex]}`)
        await page.goto(DetailUrlList[urlIndex])
        await page.waitForSelector(detailTableSelector)
        const detailTable = await page.$eval(detailTableSelector, el => el.innerText)
        const detailLevelList = detailTable.split('\n')
        const detail = detailLevelList.map(line => {
          const [name, count, prizePerWinner, prize] = line.split('\t')
          return { name, count, prizePerWinner, prize }
        })
        await page.close()
        const results = { ...dateStr[urlIndex], detail, other: [], name, lotteryID, issue: '' }
        console.log(results)
        HISTORY.push(results)
      }
    }
  } catch (err) {
    console.error(err)
    throw new VError(err, '爬虫发生预期外错误')
  } finally {
    console.log('write to file')
    writeJsonToFile(lotteryID, HISTORY)
  }
}

(async () => {
  await getHistory(startYear, endYear, lotteryID)
})()
