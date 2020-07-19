const fs = require('fs')

async function crawlHistory (lotteryId) {
  const crawler = require('../primary/' + lotteryId)
  let res = await crawler.crawlHistory()
  res = JSON.stringify(res)
  const writeStream = fs.createWriteStream(lotteryId + '.json', { encoding: 'utf-8' })
  writeStream.write(res)
  writeStream.close()
}

// crawlHistory('za-lotto')
// crawlHistory('za-lotto-plus-1')
// crawlHistory('za-lotto-plus-2')
// crawlHistory('za-powerball')
// crawlHistory('za-powerball-plus')
// crawlHistory('za-daily-lotto')
crawlHistory('za-pick-3')
