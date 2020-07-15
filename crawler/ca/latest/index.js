const crawlers = new Map()
crawlers.set('ca-daily-grand', [require('../primary/dailyGrandCrawler')])
crawlers.set('ca-daily-keno', [require('../primary/dailyKenoCrawler')])
crawlers.set('ca-lottario', [require('../primary/lottarioCrawler')])
crawlers.set('ca-lotto-649', [require('../primary/lotto649Crawler')])
crawlers.set('ca-lotto-max', [require('../primary/lottoMaxCrawler')])
crawlers.set('ca-mega-dice', [require('../primary/megaDiceCrawler')])
crawlers.set('ca-ontario-49', [require('../primary/ontario49Crawler')])
crawlers.set('ca-pick-2', [require('../primary/pick2Crawler')])
crawlers.set('ca-pick-3', [require('../primary/pick3Crawler')])
crawlers.set('ca-pick-4', [require('../primary/pick4Crawler')])
crawlers.set('ca-poker-lotto', [require('../primary/pokerLottoCrawler')])

function getCrawler (lotteryId) {
  if (crawlers.has(lotteryId)) {
    return crawlers.get(lotteryId)
  }
  return null
}

module.exports = getCrawler
