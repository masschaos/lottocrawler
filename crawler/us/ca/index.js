
const Crawler = require('./latest/crawler')
const crawlers = new Map()
const CRAWLER_CONFIGS = [
  {
    gameId: '12',
    name: 'Powerball',
    lotteryID: 'us-ca-powerball'
  },
  {
    gameId: '10',
    name: 'Fantasy 5',
    lotteryID: 'us-ca-fantasy-5'
  },
  {
    gameId: '15',
    name: 'Mega Millions',
    lotteryID: 'us-ca-mega-millions'
  },
  {
    gameId: '8',
    name: 'Superlotto Plus',
    lotteryID: 'us-ca-superlotto-plus'
  },
  {
    gameId: '9',
    name: 'Daily 3',
    lotteryID: 'us-ca-daily-3'
  },
  {
    gameId: '14',
    name: 'Daily 4',
    lotteryID: 'us-ca-daily-4'
  }
  // {
  //   gameId: '11',
  //   name: 'Daily Derby',
  //   lotteryID: 'us-ca-daily-derby'
  // }
]

for (const config of CRAWLER_CONFIGS) {
  crawlers.set(config.lotteryID,
    [Crawler.createCrawler(config.gameId, {
      name: config.name,
      lotteryID: config.lotteryID
    })]
  )
}

module.exports = crawlers
