const CrawlerMap = require('../index')
/*
 * node .\crawler\us\ca\tests\test-crawler.js us_ca-daily-3
 * node .\crawler\us\ca\tests\test-crawler.js us_ca-daily-4
 * node .\crawler\us\ca\tests\test-crawler.js us_ca-fantasy-5
 * node .\crawler\us\ca\tests\test-crawler.js us_ca-mega-millions
 * node .\crawler\us\ca\tests\test-crawler.js us_ca-powerball
 * node .\crawler\us\ca\tests\test-crawler.js us_ca-superlotto-plus
*/
async function test () {
  const crawlerId = process.argv[2]
  if (crawlerId) {
    const crawler = CrawlerMap.get(crawlerId)
    if (crawler) {
      const result = await crawler[0].crawl()
      console.log(crawlerId, JSON.stringify(result, null, 4))
    } else {
      console.log(`${crawlerId} is not exist`)
    }
  } else {
    CrawlerMap.forEach(async function (crawler, key) {
      const result = await crawler[0].crawl()
      console.log(key, JSON.stringify(result, null, 4))
    })
  }
}

test()
