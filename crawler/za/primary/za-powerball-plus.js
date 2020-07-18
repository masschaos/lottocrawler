var common = require('./common')

const lotteryID = 'za-powerball-plus'
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
  var ballNumberArray = ballKeys.map((key) => {
    return data[key].padStart(2, '0')
  })
  var powerball = data[powerballKey].padStart(2, '0')
  var ballNumers = ballNumberArray.join(',')
  var numbers = [ballNumers, powerball].join('#')
  return numbers
}

async function crawl () {
  var latestDrawIssue = await common.getLatestDrawIssue(lotteryID)
  var drawResult = await common.getDrawDetail(lotteryID, latestDrawIssue)
  var result = common.formatDrawResult(lotteryID, drawResult, divNames)
  result.numbers = getNumbers(drawResult)
  return result
}

module.exports = {
  crawl
}
