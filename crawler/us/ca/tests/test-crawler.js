const CrawlerMap = require('../index')

async function test () {
  CrawlerMap.forEach(async function (crawler, key) {
    const result = await crawler[0].crawl()
    console.log(key, JSON.stringify(result, null, 4))
  })
  // const result = await CrawlerMap.get('us-ca-daily-3')[0].crawl()
  // console.log(result)
}

test()
