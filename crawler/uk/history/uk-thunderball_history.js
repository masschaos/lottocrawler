const log = require('../../../util/log')
const { MONTH, MonthOrDayProcess, /* monthCheck, dayCheck, */ writeJsonToFile } = require('../country')
const { newPage } = require('../../../pptr')
const VError = require('verror')

const name = 'Thunderball'
const lotteryID = 'uk-thunderball'
const [startYear, endYear] = [2020, 1994]
// 'https://www.lottery.co.uk/thunderball/results'
// #siteContainer > div.main > div:nth-child(5) > div.paddedLight

const historyNumberPageSelector = '#siteContainer > div.main > table > tbody tr'
const historyDetailUrlSelector = '#siteContainer > div.main > table > tbody td a'
const detailTableSelector = '#siteContainer > div.main > table.table.thunderball.mobFormat > tbody'

const getHistory = async (startYear, endYear, lotteryID) => {
  const HISTORY = []
  try {
    log.debug(startYear, endYear)
    for (let year = startYear; year > endYear; year--) {
      const page = await newPage()
      await page.exposeFunction('MonthOrDayProcess', MonthOrDayProcess)
      const url = `https://www.lottery.co.uk/thunderball/results/archive-${year}`
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
          const drawTime = `${year}${month}${day}000000`
          const numbersList = numberString.split(' ')
          const numbers = `${numbersList.slice(0, -1).join(',')}#${numbersList.slice(-1).join(',')}`
          const jackpot = jackpotString.split('\n')[0]
          return { drawTime, numbers, jackpot: [jackpot] }
        }))
      }, MONTH)
      await page.close()

      for (let urlIndex = 0; urlIndex < DetailUrlList.length; urlIndex++) {
        const page = await newPage()
        log.debug(`==------go to page ${DetailUrlList[urlIndex]}`)
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
        log.debug(results)
        HISTORY.push(results)
      }
    }
  } catch (err) {
    log.error(err)
    throw new VError(err, '爬虫发生预期外错误')
  } finally {
    log.debug('write to file')
    writeJsonToFile(lotteryID, HISTORY)
  }
}

(async () => {
  await getHistory(startYear, endYear, lotteryID)
})()
