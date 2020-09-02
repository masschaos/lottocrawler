
const Crawler = require('./latest/crawler')
const crawlers = new Map()
const CRAWLER_CONFIGS = [
  {
    gameId: 'magic3',
    templateId: '2610',
    name: 'Magic 3',
    lotteryID: 'ch-magic-3'
  },
  {
    gameId: 'magic4',
    templateId: '1675',
    name: 'Magic 4',
    lotteryID: 'ch-magic-4'
  },
  {
    gameId: 'banco',
    templateId: '5455',
    name: 'Banco',
    lotteryID: 'ch-banco'
  },
  {
    gameId: 'swisslotto',
    templateId: '',
    name: 'Lotto',
    lotteryID: 'ch-lotto'
  },
  {
    gameId: 'euromillions',
    templateId: '',
    name: 'EuroMillions',
    lotteryID: 'ch-euromillions'
  }
]

for (const config of CRAWLER_CONFIGS) {
  crawlers.set(config.lotteryID,
    [Crawler.createCrawler(config)]
  )
}

module.exports = crawlers
