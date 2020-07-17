const VError = require('verror')
const apiManager = require('./apiManager')
const CA = require('./ca')
const ZA = require('./za')

const countries = new Map()
countries.set('ca', CA)
countries.set('za', ZA)

async function startCrawl (countryId, lotteryId) {
    let country = countries.get(countryId)
    let crawler = country.crawlers.get(lotteryId)
    let result = null
    try {
        result = await crawler.startCrawl()
    } catch {
        result = await crawler.startCrawlSub()
    }
    apiManager.saveResult(result)
}

module.exports = startCrawl
