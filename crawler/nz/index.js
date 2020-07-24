const crawlers = new Map()
crawlers.set('nz-lotto', [require('./primary/nz-lotto')])
crawlers.set('nz-keno', [require('./primary/nz-keno')])
crawlers.set('nz-bullseye', [require('./primary/nz-bullseye')])

module.exports = crawlers
// function getCrawler(lotteryId){
//     if(crawlers.has(lotteryId)){
//        return crawlers.get(lotteryId)
//     }
//     return null
// }

// module.exports = {getCrawler}
