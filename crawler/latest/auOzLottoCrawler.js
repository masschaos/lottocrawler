const auCrawler = require('./auCrawler')

class auOzLottoCrawler extends auCrawler {
    constructor(){
        super('au-oz-lotto')
    }
}

module.exports = auOzLottoCrawler