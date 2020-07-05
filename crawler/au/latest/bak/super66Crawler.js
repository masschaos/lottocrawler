const puppeteer = require('puppeteer')
const crawler = require('./crawler')

const lotteryID = 'au-super-66'
const url = 'https://australia.national-lottery.com/super-66/results'


class supper66Crawler extends crawler {
  constructor(){
    super(lotteryID)
  }

  async startCrawl (parseFunction) {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    // Goto result page
    await page.goto(url)
    const result = await parseFunction(page)
    await browser.close()
    return result
  }
  
  async parse (page) {
    const result = await page.evaluate((lotteryID) => {
      const balls = Array.from(document.querySelectorAll('#content > div.resultsOuter.full.fluid > div > div.balls > .result'))
      const drawTime = document.querySelector('#content > div.resultsOuter.full.fluid > div > div.resultsHeader.super-66').textContent.trim()
      const numberArray = balls.map((ball) => {
        return ball.textContent.trim()
      })
      const numbers = numberArray.join('|')
      return {
        lotteryID: lotteryID,
        issue: '',
        drawTime: drawTime,
        numbers: numbers,
        detail: []
      }
    }, lotteryID)
    return result
  };
  
  crawl () {
    console.log(`[备用源]${this.lotteryId} 开始爬取`)
    this.startCrawl(this.parse).then(res => {
      const data = super.assembleFormatData(res)
      console.log(`[备用源]${this.lotteryId} 爬取成功: ${JSON.stringify(data)}`)
      super.store(data)
    }).catch(err => {
      console.log(`[备用源]${this.lotteryId} 爬取失败: ${err}`)
    })
  }
}


module.exports = supper66Crawler
