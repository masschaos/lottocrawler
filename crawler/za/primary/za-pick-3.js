const common = require('./common')
const util = require('util')

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
  const detail = divNames.map((divName, index) => {
    const seq = index + 1
    const divPayoutKey = 'div' + seq + 'Payout'
    const divWinnerKey = 'div' + seq + 'Winners'
    const perMoney = Number(data[divPayoutKey]) / 100
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
  const latestDrawIssue = await common.getLatestDrawIssue(lotteryID)
  return await crawlByIssue(latestDrawIssue)
}

async function crawlByIssue (issue) {
  const drawResult = await common.getDrawDetail(lotteryID, issue)
  const result = common.formatDrawResult(lotteryID, drawResult, divNames)
  result.numbers = getNumbers(drawResult)
  result.breakDown = getBreakDown(drawResult)
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
