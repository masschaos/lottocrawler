const Crawler = require('./crawler')
const VError = require('verror')

const lotteryID = 'ca-pick-4'
const lotteryName = 'PICK-4'
const url = 'https://lottery.olg.ca/en-ca/winning-numbers/pick-4/winning-numbers'
const enFrMap = {
  Straight: "Dans l'ordre",
  '4-Way Box': 'Catégorie 4 - Désordre',
  '6-Way Box': 'Catégorie 6 - Désordre',
  '12-Way Box': 'Catégorie 12 - Désordre',
  '24-Way Box': 'Catégorie 24 - Désordre'
}

class Pick4Crawler extends Crawler {
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
        throw new VError(`${lotteryID}没有抓到数据，可能数据源不可用或有更改，请检查调度策略。`)
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

module.exports = new Pick4Crawler()
