const auMonWedLottoCrawler = require('./auMonWedLottoCrawler')
const auOzLottoCrawler = require('./auOzLottoCrawler')
const auPowerBallCrawler = require('./auPowerBallCrawler')
const auSetForLifeCrawler = require('./auSetForLifeCrawler')
const auSuper66Crawler = require('./auSuper66Crawler')

const crawlers = new Map()
crawlers.set('au-powerball', auPowerBallCrawler)
crawlers.set('au-set-for-life', auSetForLifeCrawler)
crawlers.set('au-oz-lotto', auOzLottoCrawler)
crawlers.set('au-mon-wed-lotto', auMonWedLottoCrawler)
crawlers.set('au-super-66', auSuper66Crawler)

module.exports = crawlers
