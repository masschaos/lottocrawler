const Crawler = require('./crawler')

const lotteryID = 'ca-pick-2'
const lotteryName = 'pick2'
const url = 'https://lottery.olg.ca/en-ca/winning-numbers/pick-2/winning-numbers'
const enFrMap = {
  'Match First': '1er chiffr'
}

class Pick2Crawler extends Crawler {
  async parse (page, targetDrawTime) {
    const result = await page.evaluate((targetDrawTime) => {
      const drawTimeSelector = '#video-wrap > div > div > div.main-content > div.renderContent > div.large-date-container > div:nth-child(2) > p'
      const drawTime = document.querySelector(drawTimeSelector).getAttribute('data-selecteddate')
      let numberSelector = '#eveningdraw > div > div > ul > li'
      let encoreSelector = '#eveningdraw > div > div > div > span.number'
      let mainPrizeSelector = '#pick-game3-collapse > div > div > div > div > div > div > table > tbody > tr'
      let encorePrizeSelector = '#pick-game4-collapse > div > div > div > div > div > div > table > tbody > tr'
      let timeAt = '223000'
      if ((targetDrawTime === undefined && Array.from(document.querySelectorAll(numberSelector)).length === 0) || (targetDrawTime !== undefined && targetDrawTime.slice(8) === '140000')) {
        timeAt = '140000'
        numberSelector = '#middaydraw > div > div > ul > li'
        encoreSelector = '#middaydraw > div > div > div > span.number'
        mainPrizeSelector = '#pick-game1-collapse > div > div > div > div > div > div > table > tbody > tr'
        encorePrizeSelector = '#pick-game2-collapse > div > div > div > div > div > div > table > tbody > tr'
      }

      const numberItems = Array.from(document.querySelectorAll(numberSelector))
      if (numberItems.length === 0) {
        return null
      }
      let numbers = numberItems.map((item) => {
        return item.textContent.trim()
      })
      const encore = document.querySelector(encoreSelector).textContent.trim()
      numbers = numbers.join(',') + '|' + encore

      let mainPrizes = Array.from(document.querySelectorAll(mainPrizeSelector))
      mainPrizes = mainPrizes.map((item) => {
        const tds = Array.from(item.querySelectorAll('td'))
        return {
          name: tds[0].textContent.trim(),
          count: Number(tds[2].textContent.trim().replace(',', '')),
          prize: tds[3].textContent.trim()
        }
      })

      let encoreLines = Array.from(document.querySelectorAll(encorePrizeSelector))
      encoreLines = encoreLines.map((item) => {
        const tds = Array.from(item.querySelectorAll('td'))
        return {
          name: tds[0].textContent,
          count: Number(tds[2].textContent.trim().replace(',', '')),
          prize: tds[3].textContent.trim()
        }
      })
      const mainPrize = {
        name: 'main',
        detail: mainPrizes
      }
      const encorePrize = {
        name: 'encore',
        detail: encoreLines
      }
      const breakdown = [
        mainPrize,
        encorePrize
      ]
      return {
        drawTime: drawTime,
        numbers: numbers,
        breakdown: breakdown,
        timeAt: timeAt
      }
    }, targetDrawTime)
    if (result === null) {
      return result
    }
    result.drawTime = super.dateFormatter(result.drawTime, result.timeAt)
    delete result.timeAt
    result.lotteryID = lotteryID
    result.name = lotteryName
    result.issue = ''
    result.detail = []
    result.jackpot = []
    result.other = []
    result.breakdown = super.fillFrName(result.breakdown, enFrMap)
    return result
  }

  async crawl (targetDrawTime, saveFilePath) {
    let targetUrl = url
    if (targetDrawTime !== undefined) {
      targetUrl = targetUrl + super.urlParams(targetDrawTime)
    }
    const res = await super.crawl(targetUrl, this.parse, targetDrawTime)
    if (!saveFilePath) {
      return res
    }
    await super.saveData(res, saveFilePath)
  }
}

module.exports = new Pick2Crawler()
