const primary = require('./primary')
const sub = require('./sub')
const history = require('./history')

module.exports = {
    startCrawl: primary.startCrawl,
    startCrawlSub: sub.startCrawlSub,
    startCrawlByIssue: primary.startCrawlByIssue,
    startCrawlHistory: history.startCrawlHistory
}
