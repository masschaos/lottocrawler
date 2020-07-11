const crawler = require('./crawler')

const lotteryID = 'ca-lotto-649'
const lotteryName = 'lotto 6/49'
const url = 'https://lottery.olg.ca/en-ca/winning-numbers/lotto-649/winning-numbers'
const enFrMap = {}

class lotto649Crawler extends crawler {
  async parse (page) {
    const result = await page.evaluate(() => {
      const drawTimeSelector = '#video-wrap > div > div > div.main-content > div.large-date-container > div:nth-child(2) > p'
      const drawTime = document.querySelector(drawTimeSelector).getAttribute('data-selecteddate')
      const numberSelector = 'ul.winning-numbers-list > li'
      const guaranteedSelector = '#video-wrap > div > div > div.main-content > div.renderContent > div > div.lotto-649-one-prize-draw > div.draw-container > div.prize-draw-number.draw-container-margin'
      const encoreSelector = 'div.encore-number > span.number'
      const encore = document.querySelector(encoreSelector).textContent.trim()
      const guaranteedNumbers = document.querySelector(guaranteedSelector).textContent.trim().replace('-', '#')
      const numberItems = Array.from(document.querySelectorAll(numberSelector))
      let numbers = numberItems.map((item) => {
        return item.textContent.trim()
      })
      const index = numbers.indexOf('+')
      numbers = numbers.slice(0, index).join(',') + '#' + numbers.slice(index + 1, numbers.length).join(',').replace('Bonus', '')
      numbers = [numbers, encore, guaranteedNumbers].join('|')
      const mainPrizeDrawSelector = '#lotto-649-game1collapse > div > div > div > div > div.game-prize-table.game-prize-3col-table > div > table > tbody > tr'
      const encoreDrawSelector = '#lotto-649-game3collapse > div > div > div > div > div > div > table > tbody > tr'
      const guaranteedDrawSelector = '#lotto-649-game2collapse > div > div > div > div > div > div > table > tbody > tr'
      let mainPrizes = Array.from(document.querySelectorAll(mainPrizeDrawSelector))
      mainPrizes = mainPrizes.map((item) => {
        const tds = Array.from(item.querySelectorAll('td'))
        return {
          name: tds[0].textContent.trim(),
          count: Number(tds[2].textContent.trim().replace(',', '')),
          prize: tds[3].textContent.trim()
        }
      })
      let encoreLines = Array.from(document.querySelectorAll(encoreDrawSelector))
      encoreLines = encoreLines.map((item) => {
        const tds = Array.from(item.querySelectorAll('td'))
        return {
          name: tds[0].textContent,
          count: Number(tds[2].textContent.trim().replace(',', '')),
          prize: tds[3].textContent.trim()
        }
      })
      let guaranteedLines = Array.from(document.querySelectorAll(guaranteedDrawSelector))
      guaranteedLines = guaranteedLines.map((item) => {
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
      const guaranteedPrize = {
        name: 'guaranteed',
        detail: guaranteedLines
      }
      const breakdown = [
        mainPrize,
        guaranteedPrize,
        encorePrize
      ]
      return {
        drawTime: drawTime,
        numbers: numbers,
        breakdown: breakdown
      }
    })
    result.drawTime = super.dateFormatter(result.drawTime)
    result.lotteryID = lotteryID
    result.name = lotteryName
    result.issue = ''
    result.detail = []
    result.jackpot = []
    result.other = []
    result.breakdown = super.fillFrName(result.breakdown, enFrMap)
    return JSON.stringify(result)
  }

  crawl () {
    super.crawl(url, this.parse)
      .then(res => {
        if (res === null) {
          console.log('未开奖:' + lotteryID)
        } else {
          super.saveData(res)
        }
      })
      .catch(error => {
        console.log(error)
      })
  }
}

module.exports = lotto649Crawler
