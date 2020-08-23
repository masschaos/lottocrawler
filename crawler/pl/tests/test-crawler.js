const CrawlerMap = require('../index')
const log = require('../../../util/log')
/*
 * node .\crawler\pl\tests\test-crawler.js 彩票Id 步骤Id 如果没有步骤Id，则抓取返回全部数据
 * node .\crawler\pl\tests\test-crawler.js pl-lotto result|breakdown|other
 * node .\crawler\pl\tests\test-crawler.js pl-mini-lotto
 * node .\crawler\pl\tests\test-crawler.js pl-kaskada
 * node .\crawler\pl\tests\test-crawler.js pl-super-szansa
 * node .\crawler\pl\tests\test-crawler.js pl-multi-multi
 * node .\crawler\pl\tests\test-crawler.js pl-ekstra-pensja
 * node .\crawler\pl\tests\test-crawler.js pl-eurojackpot
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
