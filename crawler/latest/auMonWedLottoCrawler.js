const auCrawler = require('./auCrawler')

class auMonWedLottoCrawler extends auCrawler {
    constructor(){
        super('au-mon-wed-lotto')
    }
}

module.exports = auMonWedLottoCrawler