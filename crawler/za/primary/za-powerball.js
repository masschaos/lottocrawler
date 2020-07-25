const common = require('./common')
const { checkDrawResult } = require('../../common')

const lotteryID = 'za-powerball'
const ballKeys = ['ball1', 'ball2', 'ball3', 'ball4', 'ball5']
const powerballKey = 'powerball'
const divNames = [
  'FIVE CORRECT NUMBERS + POWERBALL',
  'FIVE CORRECT NUMBERS',
  'FOUR CORRECT NUMBERS + POWERBALL',
  'FOUR CORRECT NUMBERS',
  'THREE CORRECT NUMBERS + POWERBALL',
  'THREE CORRECT NUMBERS',
  'TWO CORRECT NUMBERS + POWERBALL',
  'ONE CORRECT NUMBERS + POWERBALL',
  'MATCH POWERBALL'
]

// 需要各自爬虫实现
function getNumbers (data) {
  const ballNumberArray = ballKeys.map((key) => {
    return data[key].padStart(2, '0')
  })
  const powerball = data[powerballKey].padStart(2, '0')
  const ballNumers = ballNumberArray.join(',')
  const numbers = [ballNumers, powerball].join('#')
  return numbers
}

async function crawl () {
  const latestDrawIssue = await common.getLatestDrawIssue(lotteryID)
  return await crawlByIssue(latestDrawIssue)
}

async function crawlByIssue (issue) {
  const drawResult = await common.getDrawDetail(lotteryID, issue)
  const result = common.formatDrawResult(lotteryID, drawResult, divNames)
  result.numbers = getNumbers(drawResult)
  checkDrawResult(lotteryID, result)
  return result
}

async function crawlHistory (startDate, endDate) {
  const results = []
  const issues = await common.getHistoryDrawIssues(lotteryID, startDate, endDate)
  for (const issue of issues) {
    let result = null
    let retry = 0
    while (retry < 3) {
      try {
        result = await crawlByIssue(issue)
        break
      } catch (err) {
        retry = retry + 1
      }
    }
    if (result === null) {
      console.log('获取本期结果失败，id: ' + lotteryID + ', issue: ' + issues)
      continue
    }
    results.push(result)
  }
  return results
}

module.exports = {
  crawl,
  crawlByIssue,
  crawlHistory
}
