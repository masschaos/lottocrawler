
const log = require('../../util/log')

async function test () {
  const lotteryIDs = [
    'de-euro-jackpot',
    'de-glucks-spirale',
    'de-keno',
    'de-lotto-6aus49',
    'de-plus5',
    'de-spiel77',
    'de-super6'
  ]
  const getCrawler = require('./index')
  let i = 1
  for (const id of lotteryIDs) {
    log.debug(`cawler lotteryID: ${id} And No.${i++} start!`)
    console.time('t')
    const crawlers = getCrawler.get(id)
    for (const crawler of crawlers) {
      try {
        const res = await crawler.crawl()
        console.log(JSON.stringify(res))
      } catch (err) {
        log.debug(err.message)
      }
    }

    console.timeEnd('t')
  }
}

test()
