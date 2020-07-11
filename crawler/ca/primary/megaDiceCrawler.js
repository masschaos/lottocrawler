const crawler = require('./crawler')

const lotteryID = 'ca-mega-dice'
const lotteryName = 'mega dice'
const url = 'https://lottery.olg.ca/en-ca/winning-numbers/mega-dice/winning-numbers'
const enFrMap = {
  "7 Ones (1's)": '7 uns (uns)',
  "7 of a Kind (2's-6's)": '7 pareils (2 à 6)',
  '6 of a Kind': '6 pareils',
  '4 of a Kind + 3 of a Kind': '4 pareils + 3 pareils',
  '5 of a Kind': '5 pareils',
  '3 of a Kind + 3 of a Kind': '3 pareils + 3 pareils',
  '3 of a Kind + 2 Pairs': '3 pareils + 2 paires',
  Straight: 'Suite',
  '4 of a Kind': '4 pareils'
}

class megaDiceCrawler extends crawler {
  async parse (page) {
    const result = await page.evaluate(() => {
      const drawTimeSelector = '#video-wrap > div > div > div.main-content > div.renderContent > div.large-date-container > div:nth-child(2) > p'
      const drawTime = document.querySelector(drawTimeSelector).getAttribute('data-selecteddate')
      const numberSelector = 'ul.winning-numbers-list > li'
      const numberItems = Array.from(document.querySelectorAll(numberSelector))
      let numbers = numberItems.map((item) => {
        return item.textContent.trim()
      })
      const index = numbers.indexOf('+')
      numbers = numbers.slice(0, index).join(',') + '#' + numbers.slice(index + 1, numbers.length).join(',').replace('Bonus', '')
      const nightlySelector = '#mega-dice-lotto-game2collapse > div > div > div > div > div > div > table > tbody > tr'
      const instantSelector = '#mega-dice-lotto-game1collapse > div > div > div > div > div > div > table > tbody > tr'
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
        return {
          name: name,
          count: Number(tds[1].textContent.trim().replace(',', '')),
          prize: tds[2].textContent.trim()
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
    if (result === null) {
      return result
    }
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

module.exports = megaDiceCrawler
