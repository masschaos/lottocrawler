const log = require('../../../../util/log')
const CrawlerMap = require('../index')
const fs = require('fs')
const path = require('path')
/*
 * node .\crawler\us\ca\tests\test-history.js us_ca-daily-3
 * node .\crawler\us\ca\tests\test-history.js us_ca-daily-4
 * node .\crawler\us\ca\tests\test-history.js us_ca-fantasy-5
 * node .\crawler\us\ca\tests\test-history.js us_ca-mega-millions
 * node .\crawler\us\ca\tests\test-history.js us_ca-powerball
 * node .\crawler\us\ca\tests\test-history.js us_ca-superlotto-plus
*/
async function test () {
  const crawlerId = process.argv[2]
  if (crawlerId) {
    const crawler = CrawlerMap.get(crawlerId)
    if (crawler) {
      const result = await crawler[0].history()
      fs.writeFileSync(path.join(__dirname, '../history/', `${crawlerId}.json`), JSON.stringify(result, null, 4))
    } else {
      log.debug(`${crawlerId} is not exist`)
    }
  } else {
    CrawlerMap.forEach(async function (crawler, key) {
      const result = await crawler[0].history()
      fs.writeFileSync(path.join(__dirname, '../history/', `${key}.json`), JSON.stringify(result, null, 4))
    })
  }
}

test()
