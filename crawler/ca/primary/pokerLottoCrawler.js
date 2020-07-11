const crawler = require('./crawler')

const lotteryID = 'ca-poker-lotto'
const lotteryName = 'poker lotto'
const url = 'https://lottery.olg.ca/en-ca/winning-numbers/poker-lotto/winning-numbers'
const enFrMap = {
  'Royal Flush': 'Quinte Royale',
  'Straight Flush': 'Quinte',
  '4 of a Kind': 'Carré',
  'Full House': 'Main Pleine',
  Flush: 'Couleur',
  Straight: 'Séquence',
  '3 of a Kind': 'Brelan',
  '2 Pair': 'Double Paire',
  'Pair Jacks+(J.Q.K.A)': 'Paire De Valets+(v,d,r,a)'
}

class pokerLottoCrawler extends crawler {
  async parse (page) {
    const result = await page.evaluate(() => {
      const drawTimeSelector = '#video-wrap > div > div > div.main-content > div.renderContent > div.large-date-container > div:nth-child(2) > p'
      const drawTime = document.querySelector(drawTimeSelector).getAttribute('data-selecteddate')
      const numberSelector = 'ul.winning-numbers-list > li'
      const numberItems = Array.from(document.querySelectorAll(numberSelector))
      let numbers = numberItems.map((item) => {
        return item.textContent.trim()
      })
      numbers = numbers.join(',')
      const nightlySelector = '#poker-lotto-game2collapse > div > div > div > div > div > div > table > tbody > tr'
      const instantSelector = '#poker-lotto-game1collapse > div > div > div > div > div > div > table > tbody > tr'
      let nightlyPrizes = Array.from(document.querySelectorAll(nightlySelector))
      nightlyPrizes = nightlyPrizes.map((item) => {
        const tds = Array.from(item.querySelectorAll('td'))
        return {
          name: tds[0].textContent.trim(),
          count: Number(tds[2].textContent.trim().replace(',', '')),
          prize: tds[3].textContent.trim()
        }
      })

      let instantPrizes = Array.from(document.querySelectorAll(instantSelector))
      const instantNames = instantPrizes.filter((item, index) => index % 2 !== 0)
      const instantValues = instantPrizes.filter((item, index) => index % 2 === 0)
      instantPrizes = instantValues.map((item, index) => {
        const name = instantNames[index].textContent.trim()
        const tds = Array.from(item.querySelectorAll('td'))
        if (tds[2] !== undefined) {
          return {
            name: name,
            count: Number(tds[1].textContent.trim().replace(',', '')),
            prize: tds[2].textContent.trim()
          }
        }
        return {
          name: name,
          count: Number(tds[1].textContent.trim().split(' ')[0].replace(',', '')),
          prize: 'FREE PLAY',
          prizeFr: 'd’un Jeu gratuit'
        }
      })
      const nightlyPrize = {
        name: 'nightly',
        detail: nightlyPrizes
      }
      const instantPrize = {
        name: 'instant',
        detail: instantPrizes
      }
      const breakdown = [
        nightlyPrize,
        instantPrize
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

module.exports = pokerLottoCrawler
