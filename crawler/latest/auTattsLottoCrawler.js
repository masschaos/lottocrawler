const auCrawler = require('./auCrawler')

class auTattsLottoCrawler extends auCrawler {
    constructor(){
        super('au-tattslotto')
    }
}

module.exports = auTattsLottoCrawler