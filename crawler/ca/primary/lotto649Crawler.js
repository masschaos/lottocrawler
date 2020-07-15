const Crawler = require('./crawler')

const lotteryID = 'ca-lotto-649'
const lotteryName = 'lotto 6/49'
const url = 'https://lottery.olg.ca/en-ca/winning-numbers/lotto-649/winning-numbers'
const enFrMap = {}

class Lotto649Crawler extends Crawler {
  async parse (page) {
    const result = await page.evaluate(() => {
      const drawTimeSelector = '#video-wrap > div > div > div.main-content > div.large-date-container > div:nth-child(2) > p'
      const drawTime = document.querySelector(drawTimeSelector).getAttribute('data-selecteddate')
      const numberSelector = 'ul.winning-numbers-list > li'
      const guaranteedSelector = 'div.prize-draw-number.draw-container-margin'
      const encoreSelector = 'div.encore-number > span.number'
      const specilEventNumberSelector = '#guaranteed-prize-modal > div > div > div:nth-child(4) > div > ul > li'
      const numberItems = Array.from(document.querySelectorAll(numberSelector))
      if (numberItems.length === 0) {
        return null
      }
      const guaranteedNumbers = document.querySelector(guaranteedSelector).textContent.trim().replace('-', '#')
      const encore = document.querySelector(encoreSelector).textContent.trim()
      let numbers = numberItems.map((item) => {
        return item.textContent.trim()
      })
      const index = numbers.indexOf('+')
      numbers = numbers.slice(0, index).join(',') + '#' + numbers.slice(index + 1, numbers.length).join(',').replace('Bonus', '')
      numbers = [numbers, encore, guaranteedNumbers].join('|')
      let specialNumbers = Array.from(document.querySelectorAll(specilEventNumberSelector))
      const other = []
      if (specialNumbers.length !== 0) {
        specialNumbers = specialNumbers.map((item) => {
          return item.textContent.trim()
        })
        const specialPrizeSelector = '#guaranteed-prize-modal > div > div > div:nth-child(4) > p'
        let specialPrize = document.querySelector(specialPrizeSelector).textContent.trim()
        const specialCount = Number(specialPrize.split('X')[0].trim())
        specialPrize = specialPrize.split('X')[1].trim()
        specialNumbers = specialNumbers.join(',')
        other.push({
          name: 'SPECIAL EVENT',
          nameFr: 'ÉVÉNEMENTS SPÉCIAUX',
          prize: specialPrize,
          count: specialCount,
          number: specialNumbers
        })
      }

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
        breakdown: breakdown,
        other: other
      }
    })
    if (result === null) {
      return result
    }
    result.drawTime = super.dateFormatter(result.drawTime)
    result.lotteryID = lotteryID
    result.name = lotteryName
    result.issue = ''
    result.detail = []
    result.jackpot = []
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

module.exports = new Lotto649Crawler()
