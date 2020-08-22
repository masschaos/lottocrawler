const puppeteer = require('puppeteer')
const crawler = require('./crawler')
const log = require('../../../../util/log')

const lotteryID = 'au-super-66'
const url = 'https://australia.national-lottery.com/super-66/results'

class supper66Crawler extends crawler {
  constructor () {
    super(lotteryID)
  }

  // async startCrawl (parseFunction) {
  //   return new Promise(async (resolve, reject) => {
  //     try {
  //       resolve(result)
  //     } catch (error) {
  //       reject(error)
  //     }
  //   })
  // }

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

  async crawl () {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    // Goto result page
    await page.goto(url)
    const result = await this.parse(page)
    await browser.close()
    const datas = super.assembleFormatData(result) // 返回 [ data ]
    if (datas && datas.length > 0 && datas[0]) {
      log.debug(datas[0])
    } else {
      log.debug('no data')
    }
  }
}

module.exports = supper66Crawler
