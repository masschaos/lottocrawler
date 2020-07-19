const common = require('./common')

const lotteryID = 'za-lotto'
const ballKeys = ['ball1', 'ball2', 'ball3', 'ball4', 'ball5', 'ball6']
const bonusBallKey = 'bonusBall'
const divNames = [
  'SIX CORRECT NUMBERS',
  'FIVE CORRECT NUMBERS + BONUS BALL',
  'FIVE CORRECT NUMBERS',
  'FOUR CORRECT NUMBERS + BONUS BALL',
  'FOUR CORRECT NUMBERS',
  'THREE CORRECT NUMBERS + BONUS BALL',
  'THREE CORRECT NUMBERS',
  'TWO CORRECT NUMBERS + BONUS BALL'
]

// 需要各自爬虫实现
function getNumbers (data) {
  const ballNumberArray = ballKeys.map((key) => {
    return data[key].padStart(2, '0')
  })
  const bonusBallNumber = data[bonusBallKey].padStart(2, '0')
  const ballNumers = ballNumberArray.join(',')
  const numbers = [ballNumers, bonusBallNumber].join('#')
  return numbers
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
