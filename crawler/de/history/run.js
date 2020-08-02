const fs = require('fs')
const EuroJackpot = require('./de-euro-jackpot')
const GlucksSpirale = require('./de-glucks-spirale')
const Keno = require('./de-keno')
const Lotto6aus49 = require('./de-lotto-6aus49')
const Plus5 = require('./de-plus5')
const Spiel77 = require('./de-spiel77')
const Super6 = require('./de-super6')

async function crawl (lotteryID, crawler) {
  let res = await crawler.crawl()
  res = JSON.stringify(res)
  const writeStream = fs.createWriteStream('json/' + lotteryID + '.json', { encoding: 'utf-8' })
  writeStream.write(res)
  writeStream.close()
  console.log(`${lotteryID} success`)
}

async function run () {
  await crawl('de-euro-jackpot', EuroJackpot)
  await crawl('de-glucks-spirale', GlucksSpirale)
  await crawl('de-keno', Keno)
  await crawl('de-lotto-6aus49', Lotto6aus49)
  await crawl('de-plus5', Plus5)
  await crawl('de-spiel77', Spiel77)
  await crawl('de-super6', Super6)
}

run()
