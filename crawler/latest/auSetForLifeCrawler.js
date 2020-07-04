const auCrawler = require('./auCrawler')

class auSetForLifeCrawler extends auCrawler {
    constructor(){
        super('au-set-for-life')
    }
}

module.exports = auSetForLifeCrawler