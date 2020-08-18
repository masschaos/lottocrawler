const crawlers = new Map()
crawlers.set('au-tattslotto', require('./tattsLottoCrawler'))
crawlers.set('au-oz-lotto', require('./ozLottoCrawler'))
crawlers.set('au-powerball', require('./powerBallCrawler'))
crawlers.set('au-set-for-life', require('./setForLifeCrawler'))
crawlers.set('au-mon-wed-lotto', require('./monWedLottoCrawler'))
crawlers.set('au-super-66', require('./super66Crawler'))

function getCrawler (lotteryId) {
  if (crawlers.has(lotteryId)) {
    return crawlers.get(lotteryId)
  }
  return null
}

module.exports = { getCrawler }
