const { crawlHistory, crawLatest } = require('./common')
const { DrawingError } = require('../../../util/error')
const lotteryID = 'es-la-primitiva'
// 9:40
const parse = (latestDraw) => {
  const number = latestDraw.numbers.replace(/ - /g, ' ').split(' ').map(item => item.replace(/[^0-9]/ig, ''))
  if (number.length !== 8) {
    throw new DrawingError(lotteryID)
  }
  latestDraw.numbers = `${number.slice(0, 5).join(',')}#${number.slice(5, 7).join('|')}|${latestDraw.joker}`
  latestDraw.breakdown.push(latestDraw.jokerbreakdown)
  delete latestDraw.jokerbreakdown
  delete latestDraw.joker
  latestDraw.drawTime = `${latestDraw.drawTime.slice(0, 10)}4000`
  console.log(latestDraw)
  return latestDraw
}

async function crawl () {
  return crawLatest(parse, lotteryID)
}

async function crawlhistory () {
  const path = 'F:\\lottocrawler\\crawler\\es\\history\\es-la-primitiva.json'
  return await crawlHistory(parse, path, lotteryID)
}

// (async () => {
//   crawlhistory()
// })()

module.exports = {
  crawl,
  crawlhistory
}
