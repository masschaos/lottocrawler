const name = 'Irish Lotto'
const lotteryID = 'uk-irish-lotto'
// https://www.lottery.co.uk/irish-lotto/results/archive-2020

const { MONTH, MonthOrDayProcess, monthCheck, dayCheck, writeJsonToFile } = require('../country')
const { newPage } = require('../../../pptr')
const VError = require('verror')

// const { MONTH, MonthOrDayProcess, monthCheck, dayCheck } = require('../country')
// const { PuppeteerPage, writeJsonToFile } = require('../pptr')
const [startYear, endYear] = [2020, 1994]
const historyNumberPageSelector = '#siteContainer > div.main > table > tbody tr'
const historyDetailUrlSelector = '#siteContainer > div.main > table > tbody td a'
const detailTableSelector = '#siteContainer > div.main > table.table.irish.mobFormat > tbody'
const LottoPlusRaffleResultSelector = '#siteContainer > div.main > table:nth-child(5) > tbody > tr:nth-child(3) > td > div > span'

const getHistory = async (startYear, endYear, lotteryID) => {
  const HISTORY = []
  try {
    console.log(startYear, endYear)
    for (let year = startYear; year > endYear; year--) {
      const page = await newPage()
      await page.exposeFunction('MonthOrDayProcess', MonthOrDayProcess)
      await page.exposeFunction('monthCheck', monthCheck)
      await page.exposeFunction('dayCheck', dayCheck)
      const url = `https://www.lottery.co.uk/irish-lotto/results/archive-${year}`
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
          // eslint-disable-next-line
          let [weekday, day, month, year] = dateString.split(' ')
          month = await MonthOrDayProcess(MONTH[month])
          day = await MonthOrDayProcess(day)
          if (monthCheck(month) && dayCheck(day)) {
            const drawTime = `${year}${month}${day}000000`
            const numbersList = numberString.split(' ')
            const numbers = `${numbersList.slice(0, -1).join(',')}#${numbersList.slice(-1).join(',')}`
            const jackpot = jackpotString.split('\n')[0].split(' ')[0]
            return { drawTime, numbers, jackpot: [jackpot] }
          } else {
            return { error: 'error' }
          }
        }))
      }, MONTH)
      await page.close()

      for (let urlIndex = 0; urlIndex < DetailUrlList.length; urlIndex++) {
        const page = await newPage()
        console.log(`==------go to page ${DetailUrlList[urlIndex]}`)
        await page.goto(DetailUrlList[urlIndex])
        await page.waitForSelector(detailTableSelector)
        const LottoPlusRaffleResult = await page.$eval(LottoPlusRaffleResultSelector, el => el.innerText)
        const detailTable = await page.$eval(detailTableSelector, el => el.innerText)
        const detailLevelList = detailTable.split('\n')
        const detail = detailLevelList.map(line => {
          const [name, count, prizePerWinner, prize] = line.split('\t')
          return { name, count, prizePerWinner, prize }
        })
        await page.close()
        if (dateStr[urlIndex].error) {
          console.log(dateStr[urlIndex], 'error')
        } else {
          const results = { ...dateStr[urlIndex], detail, other: [], name, lotteryID, issue: '', numbers: `${dateStr[urlIndex].numbers}|${LottoPlusRaffleResult}` }
          console.log(results)
          HISTORY.push(results)
        }
      }
    }
  } catch (err) {
    throw new VError(err, '爬虫发生预期外错误')
  } finally {
    console.log('write to file')
    writeJsonToFile(lotteryID, HISTORY)
  }
}

(async () => {
  // eslint-disable-next-line
  await  getHistory(startYear, endYear, lotteryID)
})()
