const puppeteer = require('puppeteer')
const common = require('../common')

const lotteryID = 'au-super-66'
const url = 'https://australia.national-lottery.com/super-66/results'

async function startCrawl (parseFunction) {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  // Goto result page
  await page.goto(url)
  const result = await parseFunction(page)
  await browser.close()
  return result
}

async function parse (page) {
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

async function crawl () {
  const res = await startCrawl(parse)
  return common.assembleFormatData(res)
}

module.exports = crawl
