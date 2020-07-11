const crawler = require('./crawler')

const lotteryID = 'ca-pick-3'
const lotteryName = 'pick3'
const url = 'https://lottery.olg.ca/en-ca/winning-numbers/pick-3/winning-numbers'
const enFrMap = {
  Straight: "Dans l'ordre",
  Box: 'Catégorie 4 - Désordre'
}

class pick3Crawler extends crawler {
  async parse (page) {
    const result = await page.evaluate(() => {
      const drawTimeSelector = '#video-wrap > div > div > div.main-content > div.renderContent > div.large-date-container > div:nth-child(2) > p'
      const drawTime = document.querySelector(drawTimeSelector).getAttribute('data-selecteddate')
      let numberSelector = '#eveningdraw > div > div > ul > li'
      let encoreSelector = '#eveningdraw > div > div > div > span.number'
      let mainPrizeSelector = '#pick-game3-collapse > div > div > div > div > div > div > table > tbody > tr'
      let encorePrizeSelector = '#pick-game4-collapse > div > div > div > div > div > div > table > tbody > tr'
      let timeAt = '223000'
      if (document.querySelector(encoreSelector) === null || document.querySelector(encoreSelector).textContent.trim() === '') {
        timeAt = '140000'
        numberSelector = '#middaydraw > div > div > ul > li'
        encoreSelector = '#middaydraw > div > div > div > span.number'
        mainPrizeSelector = '#pick-game1-collapse > div > div > div > div > div > div > table > tbody > tr'
        encorePrizeSelector = '#pick-game2-collapse > div > div > div > div > div > div > table > tbody > tr'
      }
      const numberItems = Array.from(document.querySelectorAll(numberSelector))
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
    })
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

module.exports = pick3Crawler
