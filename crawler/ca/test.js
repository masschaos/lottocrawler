const crawlerMap = require('./index')
const { time } = require('cron')

const lotteryIds = [
  'ca-daily-grand',
  'ca-daily-keno',
  'ca-lottario',
  'ca-lotto-649',
  'ca-lotto-max',
  'ca-mega-dice',
  'ca-ontario-49',
  'ca-pick-2',
  'ca-pick-3',
  'ca-pick-4',
  'ca-poker-lotto'
]

// function testCrawlLatestDraw () {
//   lotteryIds.forEach((lotteryId) => {
//     const crawlers = getCrawler(lotteryId)
//     crawlers.forEach(crawler => {
//       new crawler().crawl()
//     })
//   })
// }

function testCrawlDrawByDrawTime () {
  lotteryIds.forEach((lotteryId) => {
    const crawlers = crawlerMap.get(lotteryId)
    run(crawlers[0])
  })
}

function run (crawler) {
  setTimeout(() => {
    crawler.crawl().then((res) => {
      console.log(res)
      //run(crawler)
    })
  }, 6)
}

// testCrawlLatestDraw()
testCrawlDrawByDrawTime()
