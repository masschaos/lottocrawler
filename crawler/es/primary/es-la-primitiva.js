const log = require('../../../util/log')
const { crawlHistory, crawLatest } = require('./common')
const { DrawingError } = require('../../../util/error')
const lotteryID = 'es-la-primitiva'
// 9:40
const parse = (latestDraw) => {
  const number = latestDraw.numbers.replace(/ - /g, ' ').split(' ').map(item => item.replace(/[^0-9]/ig, ''))
  if (number.length !== 8) {
    throw new DrawingError(lotteryID)
  }
  latestDraw.numbers = `${number.slice(0, 6).join(',')}|${number.slice(6, 8).join(',')}|${latestDraw.joker}`
  latestDraw.breakdown.push(latestDraw.jokerbreakdown)
  delete latestDraw.jokerbreakdown
  delete latestDraw.joker
  latestDraw.drawTime = `${latestDraw.drawTime.slice(0, 10)}4000`
  log.debug(latestDraw)
  return latestDraw
}

async function crawl () {
  return crawLatest(parse, lotteryID)
}

async function crawlhistory () {
  const path = 'F:\\lottocrawler\\crawler\\es\\history\\es-la-primitiva.json'
  return await crawlHistory(parse, path, lotteryID)
}

module.exports = {
  crawl,
  crawlhistory
}
