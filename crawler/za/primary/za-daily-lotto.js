const common = require('./common')

const lotteryID = 'za-daily-lotto'
const ballKeys = ['ball1', 'ball2', 'ball3', 'ball4', 'ball5']
const divNames = ['FIVE CORRECT NUMBERS', 'FOUR CORRECT NUMBERS', 'THREE CORRECT NUMBERS', 'TWO CORRECT NUMBERS']

// 需要各自爬虫实现
function getNumbers (data) {
  const ballNumberArray = ballKeys.map((key) => {
    return data[key].padStart(2, '0')
  })
  const ballNumbers = ballNumberArray.join(',')
  return ballNumbers
}

async function crawl () {
  const latestDrawIssue = await common.getLatestDrawIssue(lotteryID)
  const drawResult = await common.getDrawDetail(lotteryID, latestDrawIssue)
  const result = common.formatDrawResult(lotteryID, drawResult, divNames)
  result.numbers = getNumbers(drawResult)
  return result
}

module.exports = {
  crawl
}
