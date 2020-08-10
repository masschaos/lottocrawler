const { crawlHistory, crawLatest } = require('./common')
const { DrawingError } = require('../../../util/error')
const lotteryID = 'es-el-gordo'
// 13:00
const parse = (latestDraw) => {
  const number = latestDraw.numbers.replace(/ - /g, ' ').split(' ').map(item => item.replace(/[^0-9]/ig, ''))
  if (number.length !== 6) {
    throw new DrawingError(lotteryID)
  }
  latestDraw.numbers = `${number.slice(0, 5).join(',')}|${number.slice(5, 6)[0]}`
  // console.log(latestDraw)
  return latestDraw
}

async function crawl () {
  const result = await crawLatest(parse, lotteryID)
  result.drawTime = result.drawTime.slice(0, 8) + '130000'
  return result
}

async function crawlhistory () {
  const path = 'F:\\lottocrawler\\crawler\\es\\history\\es-el-gordo.json'
  return await crawlHistory(parse, path, lotteryID)
}

module.exports = {
  crawl,
  crawlhistory
}
