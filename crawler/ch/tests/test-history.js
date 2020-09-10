const CrawlerMap = require('../index')
const fs = require('fs')
const path = require('path')
const log = require('../../../util/log')
/*
 * node ./crawler/ch/tests/test-history.js
 * node ./crawler/ch/tests/test-history.js ch-magic-3
 * node ./crawler/ch/tests/test-history.js ch-magic-4
 * node ./crawler/ch/tests/test-history.js ch-banco
 * node ./crawler/ch/tests/test-history.js ch-lotto
 * node ./crawler/ch/tests/test-history.js ch-euromillions
*/
async function test () {
  const crawlerId = process.argv[2]
  if (crawlerId) {
    const crawler = CrawlerMap.get(crawlerId)
    if (crawler) {
      const result = await crawler[0].history()
      fs.writeFileSync(path.join(__dirname, '../history/', `${crawlerId}.json`), JSON.stringify(result, null, 4))
    } else {
      log.info(`${crawlerId} is not exist`)
    }
  } else {
    CrawlerMap.forEach(async function (crawler, key) {
      const result = await crawler[0].history()
      fs.writeFileSync(path.join(__dirname, '../history/', `${key}.json`), JSON.stringify(result, null, 4))
    })
  }
}

test()
