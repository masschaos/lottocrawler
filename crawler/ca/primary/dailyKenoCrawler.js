const crawler = require('./crawler')

const lotteryID = 'ca-daily-keno'
const lotteryName = 'daily keno'
const url = 'https://lottery.olg.ca/en-ca/winning-numbers/daily-keno/winning-numbers'
const enFrMap = {}

class dailyKenoCrawler extends crawler {
  async parse (page) {
    const result = await page.evaluate(() => {
      const drawTimeSelector = '#video-wrap > div > div > div.main-content > div.renderContent > div.large-date-container > div:nth-child(2) > p'
      const drawTime = document.querySelector(drawTimeSelector).getAttribute('data-selecteddate')
      let numberSelector = '#dailykeno-eveningdraw > div > div > ul > li'
      let encoreSelector = '#dailykeno-eveningdraw > div > div > div > span.number'
      let betSelector = '#daily-keno-game-eveningcollapse > div > div > div > div.inner.circle-slider-detail-container > div'
      let encorePrizeSelector = '#daily-keno-game-evening-encorecollapse > div > div > div > div > div > div > table > tbody > tr'
      let timeAt = '223000'
      if (document.querySelector(encoreSelector) === null || document.querySelector(encoreSelector).textContent.trim() === '') {
        timeAt = '140000'
        numberSelector = '#dailykeno-middaydraw > div > div > ul > li'
        encoreSelector = '#dailykeno-middaydraw > div > div > div > span.number'
        betSelector = '#daily-keno-game-middaycollapse > div > div > div > div.inner.circle-slider-detail-container > div'
        encorePrizeSelector = '#daily-keno-game-midday-encorecollapse > div > div > div > div > div > div > table > tbody > tr'
      }
      const encore = document.querySelector(encoreSelector).textContent.trim()
      const numberItems = Array.from(document.querySelectorAll(numberSelector))
      let numbers = numberItems.map((item) => {
        return item.textContent.trim()
      })
      numbers = numbers.join(',') + '|' + encore

      const breakdown = Array.from(document.querySelectorAll(betSelector)).map((item, index) => {
        const name = '$' + index
        const detail = Array.from(document.querySelectorAll('div > div > table > tbody > tr')).map((item) => {
          const tds = Array.from(item.querySelectorAll('td'))
          return {
            name: tds[0].textContent.trim(),
            count: Number(tds[2].textContent.trim().replace(',', '')),
            prize: tds[3].textContent.trim()
          }
        })
        return {
          name: name,
          detail: detail
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
      const encorePrize = {
        name: 'encore',
        detail: encoreLines
      }
      breakdown.push(encorePrize)
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

module.exports = dailyKenoCrawler
