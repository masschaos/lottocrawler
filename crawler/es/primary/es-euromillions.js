const log = require('../../../util/log')
const { crawlHistory, crawLatest } = require('./common')
const { DrawingError } = require('../../../util/error')
const lotteryID = 'es-euromillions'
// 9:00
const parse = (latestDraw) => {
  const number = latestDraw.numbers.trim().replace(/ - /g, ' ').split(' ').map(item => item.replace(/[^0-9]/ig, ''))
  if (number.length !== 7) {
    log.debug(number, 'number')
    throw new DrawingError(lotteryID)
  }
  latestDraw.breakdown.push(latestDraw.millonbreakdown)
  latestDraw.numbers = `${number.slice(0, 5).join(',')}|${number.slice(5, 7).join(',')}|${latestDraw.millon}`
  delete latestDraw.millonbreakdown
  delete latestDraw.millon
  return latestDraw
}

async function crawl () {
  return crawLatest(parse, lotteryID)
}

async function crawlhistory () {
  const path = 'F:\\lottocrawler\\crawler\\es\\history\\es-euromillions.json'
  return await crawlHistory(parse, path, lotteryID)
}

module.exports = {
  crawl,
  crawlhistory
}
