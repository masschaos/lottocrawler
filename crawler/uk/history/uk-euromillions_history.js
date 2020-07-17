const name = 'EuroMillions'
const lotteryID = 'uk-euromillions'
// const other = []
// const jackpot = []
// const drawTime = ''
// const issue = ''
// const number = ''
// const detail = []

const { MONTH, MonthOrDayProcess, writeJsonToFile } = require('../country')
const { newPage } = require('../../../pptr')
const VError = require('verror')

const [startYear, endYear] = [2020, 1994]
const historyNumberPageSelector = '#siteContainer > div.main > table > tbody tr'
const historyDetailUrlSelector = '#siteContainer > div.main > table > tbody td a'
const detailTableSelector = '#siteContainer > div.main > table.table.euromillions.mobFormat > tbody'

const getHistory = async (startYear, endYear, lotteryID) => {
  const HISTORY = []
  try {
    console.log(startYear, endYear)
    for (let year = startYear; year > endYear; year--) {
      const page = await newPage()
      await page.exposeFunction('MonthOrDayProcess', MonthOrDayProcess)
      const url = `https://www.lottery.co.uk/euromillions/results/archive-${year}`
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
          const [dateString, numberString, MillionaireMakerString, jackpotString] = item.innerText.split('\t')
          let [weekday, day, month, year] = dateString.split(' ')
          month = await MonthOrDayProcess(MONTH[month])
          day = await MonthOrDayProcess(day)
          const drawTime = `${year}${month}${day}000000`
          const numbersList = numberString.split(' ')
          console.log(numbersList, 'numbersList')
          const numbers = `${numbersList.slice(0, -2).join(',')}#${numbersList.slice(-2).join(',')}|${MillionaireMakerString}`
          const jackpot = jackpotString.split('\n')[0]
          return { drawTime, numbers, jackpot: [jackpot] }
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
    throw new VError(err, '爬虫发生预期外错误')
  } finally {
    console.log('write to file')
    writeJsonToFile(lotteryID, HISTORY)
  }
}

// (async () => {
//     const newData = await getHistory(startYear, endYear, lotteryID)
// })()
