
const log = require('../../util/log')
const crawlers = require('./index')

const lotteryIds = [
  'nz-lotto',
  'nz-keno',
  'nz-bullseye'
]

function testCrawlLatestDraw () {
  lotteryIds.forEach((lotteryId) => {
    const crawlerFuncs = crawlers.get(lotteryId)
    crawlerFuncs.forEach(async crawler => {
      log.debug('lotteryId res==', JSON.stringify(await crawler.crawl()))
    })
  })
}

testCrawlLatestDraw()
