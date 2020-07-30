const { crawlHistory, crawLatest } = require('./common')
const { DrawingError } = require('../../../util/error')
const lotteryID = 'es-bonoloto'
// 9:30
const parse = (latestDraw) => {
  const number = latestDraw.numbers.replace(/ - /g, ' ').split(' ').map(item => item.replace(/[^0-9]/ig, ''))
  if (number.length !== 8) {
    throw new DrawingError(lotteryID)
  }
  latestDraw.numbers = `${number.slice(0, 5).join(',')}#${number.slice(5, 6)[0]}|${number.slice(6, 7)[0]}`
  latestDraw.drawTime = `${latestDraw.drawTime.slice(0, 10)}3000`
  console.log(latestDraw)
  return latestDraw
}

async function crawl () {
  return crawLatest(parse, lotteryID)
}

async function crawlhistory () {
  const path = 'F:\\lottocrawler\\crawler\\es\\history\\es-bonoloto.json'
  return await crawlHistory(parse, path, lotteryID)
}

// (async () => {
//   crawlhistory()
// })()
module.exports = {
  crawl,
  crawlhistory
}
