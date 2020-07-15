const puppeteer = require('puppeteer')
const axios = require('axios')
const date_format = require('../../../../util/format').date_format

class crawler {
  constructor(lotteryId){
    this.lotteryId = lotteryId
    this.lottoIdConfig = {
      'au-powerball': 'Powerball',
      'au-set-for-life': 'Set for Life',
      'au-oz-lotto': 'Oz Lotto',
      'au-mon-wed-lotto': 'Mon & Wed Lotto',
      'au-super-66': 'Super 66',
      'au-tattslotto': 'TattsLotto'
    } 
  }

  assembleFormatData (originData) {
      const lotteryID = originData.lotteryID
      let drawTime = originData.drawTime
      const issue = originData.issue
      const numbers = originData.numbers
      let detail = originData.detail
      detail = detail.map(item => {
        item.Winners = Number(item.Winners.replace(',', ''))
        return item
      })
      const lotteryName = this.lottoIdConfig[lotteryID]
      const jackpot = detail.slice(0, 1)
      const other = detail.slice(1)
      drawTime = date_format(drawTime)
    
      const data = {
        drawTime: drawTime,
        detail: detail,
        jackpot: jackpot,
        other: other,
        issue: issue,
        numbers: numbers,
        name: lotteryName,
        lotteryID: lotteryID
      }
      return [data]
    }

  async crawl (url, parseFunction) {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    try{
      // Goto result page
      await page.goto(url)

      // View prize divisions
      const viewDivisionsSelector = '#content > div.resultsOuter.full.fluid > div > span > a'
      await page.waitForSelector(viewDivisionsSelector)
      await page.click(viewDivisionsSelector)

      // Display balls in drawn order
      const ballOrderSelector = '#ballOrderButton'
      await page.waitForSelector(ballOrderSelector)
      await page.click(ballOrderSelector)

      const result = await parseFunction(page)
      return result

    } finally{
      await browser.close()
    }
  }
}


module.exports = crawler
