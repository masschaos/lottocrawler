const Crawler = require('./crawler')
const { DrawingError } = require('../../../util/error')

const lotteryID = 'ca-lotto-max'
const lotteryName = 'LOTTO MAX'
const url = 'https://lottery.olg.ca/en-ca/winning-numbers/lotto-max/winning-numbers'
const enFrMap = {}

class LottoMaxCrawler extends Crawler {
  async parse (page) {
    const result = await page.evaluate((lotteryID) => {
      const drawTimeSelector = '#video-wrap > div > div > div.main-content > div.renderContent > div.large-date-container > div:nth-child(2) > p'
      const drawTime = document.querySelector(drawTimeSelector).getAttribute('data-selecteddate')
      const numberSelector = 'ul.winning-numbers-list > li'
      const encoreSelector = 'div.encore-number > span.number'
      const numberItems = Array.from(document.querySelectorAll(numberSelector))
      if (numberItems.length === 0) {
        return window.vError(`${lotteryID}没有抓到数据，可能数据源不可用或有更改，请检查调度策略。`)
      }
      let numbers = numberItems.map((item) => {
        return item.textContent.trim()
      })
      const encoreItem = document.querySelector(encoreSelector)
      if (encoreItem === null) {
        return 'DrawingError'
      }
      const encore = encoreItem.textContent.trim()
      const index = numbers.indexOf('+')
      numbers = numbers.slice(0, index).join(',') + '#' + numbers.slice(index + 1, numbers.length).join(',').replace('Bonus', '') + '|' + encore
      const mainPrizeDrawSelector = '#lotto-max-game1collapse > div > div > div > div > div.game-prize-table.game-prize-3col-table > div > table > tbody > tr'
      const freePlayCountSelector = '#lotto-max-game1collapse > div > div > div > div > div.game-prize-table.game-prize-2col-table.lotto-max-prize.lotto-max-prize2 > div > table > tbody > tr > td.chart-prize-col'
      const encoreDrawSelector = '#lotto-max-game3collapse > div > div > div > div > div > div > table > tbody > tr'
      let mainPrizes = Array.from(document.querySelectorAll(mainPrizeDrawSelector))
      mainPrizes = mainPrizes.map((item) => {
        const tds = Array.from(item.querySelectorAll('td'))
        return {
          name: tds[0].textContent.trim(),
          count: Number(tds[2].textContent.trim().replace(',', '')),
          prize: tds[3].textContent.trim()
        }
      })
      let freeCount = document.querySelector(freePlayCountSelector)
      if (freeCount !== null) {
        freeCount = Number(freeCount.textContent.trim().split(' ')[0].replace(',', ''))
        mainPrizes.push({
          name: '3/7',
          count: freeCount,
          prize: 'FREE PLAY',
          prizeFr: 'd’un Jeu gratuit'
        })
      }
      let encoreLines = Array.from(document.querySelectorAll(encoreDrawSelector))
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
        name: 'encode',
        detail: encoreLines
      }
      const breakdown = [
        mainPrize,
        encorePrize
      ]
      return {
        drawTime: drawTime,
        numbers: numbers,
        breakdown: breakdown
      }
    }, lotteryID)
    if (result === 'DrawingError') {
      throw new DrawingError(lotteryID)
    }
    result.drawTime = super.dateFormatter(result.drawTime)
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
    const res = await super.crawl(lotteryID, targetUrl, this.parse, targetDrawTime)
    if (!saveFilePath) {
      return res
    }
    await super.saveData(res, saveFilePath)
  }
}

module.exports = new LottoMaxCrawler()
