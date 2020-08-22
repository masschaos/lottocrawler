const log = require('../../util/log')

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
      log.debug(JSON.stringify(res))
    }
  }
}

async function history () {
  const country = 'za'
  const lotteryIDs = [
    'za-daily-lotto'
  ]
  const getCrawler = require('../../crawler/' + country)
  for (const id of lotteryIDs) {
    const crawlers = getCrawler.get(id)
    for (const crawler of crawlers) {
      const res = await crawler.crawlHistory('20200701', '20200710')
      log.debug(JSON.stringify(res))
    }
  }
}

start()
history()
