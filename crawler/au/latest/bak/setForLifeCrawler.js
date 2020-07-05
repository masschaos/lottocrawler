const crawler = require('./crawler')

const lotteryID = 'au-set-for-life'
const url = 'https://australia.national-lottery.com/set-for-life/results'

class setForLifeCrawler extends crawler {
  constructor(){
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
    console.log(`[备用源]${this.lotteryId} 开始爬取`)
    super.crawl(url, this.parse).then(res => {
      const data = super.assembleFormatData(res)
      console.log(`[备用源]${this.lotteryId} 爬取成功: ${JSON.stringify(data)}`)
      super.store(data)
    }).catch(err => {
      console.log(`[备用源]${this.lotteryId} 爬取失败: ${err}`)
    })
  }
}



module.exports = setForLifeCrawler
