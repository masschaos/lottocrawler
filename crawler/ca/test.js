const getCrawler = require('./index').getCrawler

const lotteryIds = [
  // 'ca-daily-grand',
  // 'ca-daily-keno',
  // 'ca-lottario',
  'ca-lotto-649'
  // 'ca-lotto-max',
  // 'ca-mega-dice',
  // 'ca-ontario-49',
  // 'ca-pick-2',
  // 'ca-pick-3',
  // 'ca-pick-4',
  // 'ca-poker-lotto'
]

function testCrawlLatestDraw () {
  lotteryIds.forEach((lotteryId) => {
    const crawlers = getCrawler(lotteryId)
    crawlers.forEach(crawler => {
      new crawler().crawl()
    })
  })
}

function testCrawlDrawByDrawTime () {
  lotteryIds.forEach((lotteryId) => {
    const crawlers = getCrawler(lotteryId)
    crawlers.forEach(crawler => {
      new crawler().crawl('20190731140000', 'test.json')
    })
  })
}

// testCrawlLatestDraw()
testCrawlDrawByDrawTime()
