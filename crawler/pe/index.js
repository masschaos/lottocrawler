const Crawler = require('./crawler')
const crawlers = new Map()
const lotteryList = [
  {
    other: [],
    name: 'Gana Diario',
    lotteryID: 'pe-gana-diario',
    issue: '',
    indexPagePath: '/peru/ganadiario.php',
    time: '183500'

  }, {
    other: [],
    name: 'Kabala',
    lotteryID: 'pe-kabala',
    issue: '',
    indexPagePath: '/peru/kabala.php',
    time: '165000'
  }, {
    other: [],
    name: 'Tinka',
    lotteryID: 'pe-tinka',
    issue: '',
    indexPagePath: '/peru/tinka.php',
    time: '165000'
  }]

for (const config of lotteryList) {
  crawlers.set(config.lotteryID,
    [Crawler.createCrawler(config)]
  )
}

module.exports = crawlers
