
const Crawler = require('./latest/crawler')
const crawlers = new Map()
const CRAWLER_CONFIGS = [
  {
    gameId: '12',
    name: 'Powerball',
    lotteryID: 'us-ca-powerball',
    drawTime: '195900',
    specialChar: '|',
    noSpecialChar: ','
  },
  {
    gameId: '10',
    name: 'Fantasy 5',
    lotteryID: 'us-ca-fantasy-5',
    drawTime: '183000',
    specialChar: '|',
    noSpecialChar: ','
  },
  {
    gameId: '15',
    name: 'Mega Millions',
    lotteryID: 'us-ca-mega-millions',
    drawTime: '200000',
    specialChar: '|',
    noSpecialChar: ','
  },
  {
    gameId: '8',
    name: 'Superlotto Plus',
    lotteryID: 'us-ca-superlotto-plus',
    drawTime: '195700',
    specialChar: '|',
    noSpecialChar: ','
  },
  {
    gameId: '9',
    name: 'Daily 3',
    lotteryID: 'us-ca-daily-3',
    drawTime: ['130000', '183000'],
    specialChar: '|',
    noSpecialChar: '|'
  },
  {
    gameId: '14',
    name: 'Daily 4',
    lotteryID: 'us-ca-daily-4',
    drawTime: '183000',
    specialChar: '|',
    noSpecialChar: '|'
  }
  // {
  //   gameId: '11',
  //   name: 'Daily Derby',
  //   lotteryID: 'us-ca-daily-derby'
  // }
]

for (const config of CRAWLER_CONFIGS) {
  crawlers.set(config.lotteryID,
    [Crawler.createCrawler(config)]
  )
}

module.exports = crawlers
