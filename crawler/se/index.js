
const Crawler = require('./latest/crawler')
const crawlers = new Map()
const CRAWLER_CONFIGS = [
  {
    gameId: 'lotto',
    templateId: 'lotto',
    name: 'Lotto',
    lotteryID: 'se-lotto',
    specialChar: '|',
    noSpecialChar: ','
  },
  {
    gameId: 'vikinglotto',
    templateId: 'viking',
    name: 'Vikinglotto',
    lotteryID: 'se-vikinglotto',
    specialChar: '|',
    noSpecialChar: ','
  },
  {
    gameId: 'keno',
    templateId: 'keno',
    name: 'Keno',
    lotteryID: 'se-keno',
    specialChar: '|',
    noSpecialChar: ','
  },
  {
    gameId: 'eurojackpot',
    templateId: 'eurojackpot',
    name: 'Eurojackpot',
    lotteryID: 'se-eurojackpot',
    specialChar: ',',
    noSpecialChar: ',',
    drawTime: '230000'
  }
]

for (const config of CRAWLER_CONFIGS) {
  crawlers.set(config.lotteryID,
    [Crawler.createCrawler(config)]
  )
}

module.exports = crawlers
