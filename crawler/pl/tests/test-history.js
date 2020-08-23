const CrawlerMap = require('../index')
const fs = require('fs')
const path = require('path')
const log = require('../../../util/log')
/*
 * node .\crawler\pl\tests\test-history.js pl-lotto
 * node .\crawler\pl\tests\test-history.js pl-mini-lotto
 * node .\crawler\pl\tests\test-history.js pl-kaskada
 * node .\crawler\pl\tests\test-history.js pl-super-szansa
 * node .\crawler\pl\tests\test-history.js pl-multi-multi
 * node .\crawler\pl\tests\test-history.js pl-ekstra-pensja
 * node .\crawler\pl\tests\test-history.js pl-eurojackpot
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
