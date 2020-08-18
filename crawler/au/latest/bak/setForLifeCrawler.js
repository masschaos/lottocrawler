const crawler = require('./crawler')

const lotteryID = 'au-set-for-life'
const url = 'https://australia.national-lottery.com/set-for-life/results'

class setForLifeCrawler extends crawler {
  constructor () {
    super(lotteryID)
  }

  async parse (page) {
    const result = await page.evaluate((lotteryID) => {
      const balls = Array.from(document.querySelectorAll('#ballsCell > .set-for-life-ball'))
      const ballNumbers = balls.map((ball) => {
        return ball.textContent.trim()
      })
      const superBalls = Array.from(document.querySelectorAll('#ballsCell > .set-for-life-bonus-ball'))
      const superBallNumbers = superBalls.map((ball) => {
        return ball.textContent.trim()
      })
      const numbers = ballNumbers.join(',') + '#' + superBallNumbers.join(',')
      const drawTime = document.querySelector('#breadcrumb > li:nth-child(4)').textContent.trim()
      let issue = document.querySelector('#content > div > div > div.resultsHeader.set-for-life > strong').textContent.trim()
      issue = issue.replace('Draw No. ', '')

      const detailArray = Array.from(document.querySelector('#content > table').querySelectorAll('tr')).slice(1)
      const detail = detailArray.map((detailItem, index) => {
        return {
          Division: (index + 1).toString(),
          Winners: detailItem.querySelector('td:nth-child(2)').textContent.trim().split('\n')[0],
          'Division Prize': detailItem.querySelector('td:nth-child(3)').textContent.trim()
        }
      })
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
    const res = await super.crawl(url, this.parse)
    const data = super.assembleFormatData(res)
    if (data && data.length > 0) {
      const idxs = Object.keys(data)
      for (const idx in idxs) {
        const item = data[idx]
        console.log(item)
      }
    }
  }
}

module.exports = setForLifeCrawler
