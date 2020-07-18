var common = require('./common')
var util = require('util')

const lotteryID = 'za-pick-3'
const divNames = [
  'STRAIGHT',
  '3-WAY MIX',
  '6-WAY MIX',
  'FRONT PAIR',
  'BACK PAIR',
  'SPLIT PAIR'
]

function getNumbers (data) {
  return data.drawnNumber.split('').join('|')
}

function getBreakDown (data) {
  var detail = divNames.map((divName, index) => {
    var seq = index + 1
    var divPayoutKey = 'div' + seq + 'Payout'
    var divWinnerKey = 'div' + seq + 'Winners'
    var perMoney = Number(data[divPayoutKey]) / 100
    return {
      name: divName,
      count: data[divWinnerKey],
      prize: util.format(
        'R3:%s|R5:%s|R10:%s|R20:%s',
        common.formatMoney(perMoney * 3),
        common.formatMoney(perMoney * 5),
        common.formatMoney(perMoney * 10),
        common.formatMoney(perMoney * 20))
    }
  })
  return {
    name: 'main',
    detail: detail
  }
}

async function crawl () {
  var latestDrawIssue = await common.getLatestDrawIssue(lotteryID)
  var drawResult = await common.getDrawDetail(lotteryID, latestDrawIssue)
  var result = common.formatDrawResult(lotteryID, drawResult)
  result.numbers = getNumbers(drawResult)
  result.breakdown = getBreakDown(drawResult)
  return result
}

module.exports = {
  crawl
}
