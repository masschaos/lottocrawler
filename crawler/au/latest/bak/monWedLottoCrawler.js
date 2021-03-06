const crawer = require('./crawler')
const log = require('../../../../util/log')

const lotteryID = 'au-mon-wed-lotto'
const monUrl = 'https://australia.national-lottery.com/monday-lotto/results'
const wedUrl = 'https://australia.national-lottery.com/wednesday-lotto/results'

class monWedLottoCrawler extends crawer {
  constructor () {
    super(lotteryID)
  }

  async parse (page) {
    const result = await page.evaluate((lotteryID) => {
      const balls = Array.from(document.querySelectorAll('#ballsCell > .lotto-ball'))
      const ballNumbers = balls.map((ball) => ball.textContent.trim())
      const superBalls = Array.from(document.querySelectorAll('#ballsCell > .lotto-supplementary'))
      const superBallNumbers = superBalls.map((ball) => ball.textContent.trim())
      const numbers = ballNumbers.join(',') + '#' + superBallNumbers.join(',')
      const drawTime = document.querySelector('#breadcrumb > li:nth-child(4)').textContent.trim()
      let issue = document.querySelector('#content > div.resultsOuter.full.fluid > div > div.resultsHeader.lotto > strong').textContent.trim()
      issue = issue.replace('Draw No. ', '')

      const detailArray = Array.from(document.querySelector('#content > table').querySelectorAll('tr')).slice(1)
      const detail = detailArray.map((detailItem, index) => ({
        Division: (index + 1).toString(),
        Winners: detailItem.querySelector('td:nth-child(2)').textContent.trim().split('\n')[0],
        'Division Prize': detailItem.querySelector('td:nth-child(3)').textContent.trim()
      }))
      return {
        lotteryID: lotteryID,
        issue: issue,
        drawTime: drawTime,
        numbers: numbers,
        detail: detail
      }
    }, lotteryID)
    return result
  }

  async crawl () {
    try {
      const mon = await super.crawl(monUrl, this.parse)
      const wed = await super.crawl(wedUrl, this.parse)
      if (mon === null || wed === null) {
        return null
      }
      const data = mon.issue > wed.issue ? mon : wed

      if (data) {
        log.debug(data)
      }
    } catch (err) {
      log.error(err)
    }
  }
}
module.exports = monWedLottoCrawler
