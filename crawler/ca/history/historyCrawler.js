const moment = require('moment')
const log = require('../../../util/log')

const crawlers = new Map()
crawlers.set('ca-daily-grand', require('../primary/dailyGrandCrawler'))
crawlers.set('ca-daily-keno', require('../primary/dailyKenoCrawler'))
crawlers.set('ca-lottario', require('../primary/lottarioCrawler'))
crawlers.set('ca-lotto-649', require('../primary/lotto649Crawler'))
crawlers.set('ca-lotto-max', require('../primary/lottoMaxCrawler'))
crawlers.set('ca-mega-dice', require('../primary/megaDiceCrawler'))
crawlers.set('ca-ontario-49', require('../primary/ontario49Crawler'))
crawlers.set('ca-pick-2', require('../primary/pick2Crawler'))
crawlers.set('ca-pick-3', require('../primary/pick3Crawler'))
crawlers.set('ca-pick-4', require('../primary/pick4Crawler'))
crawlers.set('ca-poker-lotto', require('../primary/pokerLottoCrawler'))

const startDate = '20190701'
const today = moment()

function singleDraw (lotteryId, targetDrawDate) {
  // 每天开奖一次
  if (today.isBefore(targetDrawDate)) {
    return
  }
  const Crawler = crawlers.get(lotteryId)
  const targetOutput = 'output/' + lotteryId + '.json'
  const targetDrawTime = targetDrawDate.format('YYYYMMDD') + '000000'
  new Crawler().crawl(targetDrawTime, targetOutput)
    .then((res) => {
      targetDrawDate.add(1, 'd')
      singleDraw(lotteryId, targetDrawDate)
    })
    .catch(error => {
      log.debug(error)
    })
}

function multiDraw (lotteryId, targetDrawDate) {
  // 每天开奖两次
  if (today.isBefore(targetDrawDate)) {
    return
  }
  const Crawler = crawlers.get(lotteryId)
  const targetOutput = 'output/' + lotteryId + '.json'
  let targetDrawTime = targetDrawDate.format('YYYYMMDD') + '140000'
  const midday = new Crawler().crawl(targetDrawTime, targetOutput)
  targetDrawTime = targetDrawDate.format('YYYYMMDD') + '223000'
  const evening = new Crawler().crawl(targetDrawTime, targetOutput)
  Promise.all([midday, evening])
    .then((res) => {
      setTimeout(() => {
        targetDrawDate.add(1, 'd')
        multiDraw(lotteryId, targetDrawDate)
      }, 5000)
    })
    .catch(error => {
      log.debug(error)
    })
}

// singleDraw('ca-daily-grand', moment(startDate))
// singleDraw('ca-lottario', moment(startDate))
// singleDraw('ca-lotto-649', moment(startDate))
// singleDraw('ca-lotto-max', moment(startDate))
// singleDraw('ca-mega-dice', moment(startDate))
// singleDraw('ca-ontario-49', moment(startDate))

singleDraw('ca-poker-lotto', moment(startDate))

multiDraw('ca-pick-2', moment(startDate))
multiDraw('ca-pick-3', moment(startDate))
multiDraw('ca-pick-4', moment(startDate))
multiDraw('ca-daily-keno', moment(startDate))
