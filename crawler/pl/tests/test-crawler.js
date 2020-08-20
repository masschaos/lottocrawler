const CrawlerMap = require('../index')
/*
 * node .\crawler\pl\tests\test-crawler.js pl-lotto
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
