const crawler = require('./crawler')

const lotteryID = 'au-oz-lotto'
const url = 'https://australia.national-lottery.com/oz-lotto/results'

class ozLottoCrawler extends crawler {
  constructor () {
    super(lotteryID)
  }

  async parse (page) {
    const result = await page.evaluate((lotteryID) => {
      const balls = Array.from(document.querySelectorAll('#ballsCell > .oz-lotto-ball'))
      const ballNumbers = balls.map((ball) => ball.textContent.trim())
      const superBalls = Array.from(document.querySelectorAll('#ballsCell > .oz-lotto-supplementary'))
      const superBallNumbers = superBalls.map((ball) => ball.textContent.trim())
      const numbers = ballNumbers.join(',') + '#' + superBallNumbers.join(',')
      const drawTime = document.querySelector('#breadcrumb > li:nth-child(4)').textContent.trim()
      let issue = document.querySelector('#content > div.resultsOuter.full.fluid > div > div.resultsHeader.oz-lotto > strong').textContent.trim()
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

module.exports = ozLottoCrawler
