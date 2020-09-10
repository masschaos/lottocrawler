const CrawlerMap = require('../index')
const log = require('../../../util/log')
/*
 * node ./crawler/ch/tests/test-crawler.js
 * node ./crawler/ch/tests/test-crawler.js ch-magic-3
 * node ./crawler/ch/tests/test-crawler.js ch-magic-4
 * node ./crawler/ch/tests/test-crawler.js ch-banco
 * node ./crawler/ch/tests/test-crawler.js ch-lotto
 * node ./crawler/ch/tests/test-crawler.js ch-euromillions
*/
async function test () {
  const crawlerId = process.argv[2]
  if (crawlerId) {
    const crawler = CrawlerMap.get(crawlerId)
    if (crawler) {
      const stepId = process.argv[3]
      const result = await crawler[0].crawl(stepId)
      log.info({
        crawlerId,
        response: result
      })
    } else {
      log.info(`${crawlerId} is not exist`)
    }
  } else {
    CrawlerMap.forEach(async function (crawler, key) {
      const result = await crawler[0].crawl()
      log.info(
        {
          crawlerId: key,
          response: result
        })
    })
  }
}

test()
