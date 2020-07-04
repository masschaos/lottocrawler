let auTattsLottoCrawler = require('./auTattsLottoCrawler')
let auOzLottoCrawler = require('./auOzLottoCrawler')
let auPowerBallCrawler = require('./auPowerBallCrawler')
let auSetForLifeCrawler = require('./auSetForLifeCrawler')
let auMonWedLottoCrawler = require('./auMonWedLottoCrawler')
let auSuper66Crawler = require('./auSuper66Crawler')

let crawlers = new Map()
crawlers.set('au-tattslotto', auTattsLottoCrawler)
crawlers.set('au-oz-lotto', auOzLottoCrawler)
crawlers.set('au-powerball', auPowerBallCrawler)
crawlers.set('au-set-for-life', auSetForLifeCrawler)
crawlers.set('au-mon-wed-lotto', auMonWedLottoCrawler)
crawlers.set('au-super-66', auSuper66Crawler)

function getCrawler(lotteryId){
    if(crawlers.has(lotteryId)){
       return crawlers.get(lotteryId)
    }
    return null
}

module.exports = {getCrawler}