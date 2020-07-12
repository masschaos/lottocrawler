let crawlers = new Map()
// crawlers.set('au-tattslotto', [require('./tattsLottoCrawler')])
// crawlers.set('au-oz-lotto', [require('./ozLottoCrawler'),require('./bak/ozLottoCrawler')])
// crawlers.set('au-powerball', [require('./powerBallCrawler'),require('./bak/powerBallCrawler')])
// crawlers.set('au-set-for-life', [require('./setForLifeCrawler'),require('./bak/setForLifeCrawler')])
crawlers.set('au-mon-wed-lotto', [
    require('./monWedLottoCrawler'),
    require('./bak/monWedLottoCrawler')])
// crawlers.set('au-super-66', [require('./super66Crawler'),require('./bak/super66Crawler')])

function getCrawler(lotteryId){
    if(crawlers.has(lotteryId)){
       return crawlers.get(lotteryId)
    }
    return null
}

module.exports = {getCrawler}