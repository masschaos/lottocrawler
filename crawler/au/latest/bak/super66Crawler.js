const puppeteer = require('puppeteer')
const crawler = require('./crawler')
const {innerApi} = require("../../../../util/api")

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
    this.startCrawl(this.parse).then(res => {
      const data = super.assembleFormatData(res)
      if(data && data.length > 0){
        for(let idx in data){
            const item = this.parse(data[idx])
            await new innerApi().saveLastestResult(item)
        }
      }
    }).catch(error => {
      console.log(error)
    })
  }
}


module.exports = supper66Crawler
