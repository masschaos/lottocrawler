const getCrawler = require('./index').getCrawler

const lotteryIds = [
  'nz-lotto',
  'nz-keno',
  'nz-bullseye'
]

function testCrawlLatestDraw () {
  lotteryIds.forEach((lotteryId) => {
    const crawlers = getCrawler(lotteryId)
    crawlers.forEach(async crawler => {
      console.log("==", JSON.stringify(await crawler.crawl()))
    })
  })
}

testCrawlLatestDraw()
