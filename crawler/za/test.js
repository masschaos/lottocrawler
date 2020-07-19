async function start () {
  const country = 'za'
  const lotteryIDs = [
    'za-daily-lotto',
    'za-lotto',
    'za-lotto-plus-1',
    'za-lotto-plus-2',
    'za-pick-3',
    'za-powerball',
    'za-powerball-plus'
  ]
  const getCrawler = require('../../crawler/' + country)
  for (const id of lotteryIDs) {
    const crawlers = getCrawler.get(id)
    for (const crawler of crawlers) {
      const res = await crawler.crawl()
      console.log(JSON.stringify(res))
    }
  }
}

start()
