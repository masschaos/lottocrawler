const auCrawler = require('./auCrawler')

class auPowerBallCrawler extends auCrawler {
    constructor(){
        super('au-powerball')
    }
}

module.exports = auPowerBallCrawler