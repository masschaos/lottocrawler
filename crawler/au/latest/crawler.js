const { auCrawlerApi, saveLastestResult } = require('../../../inner/api')

class Crawler {
  constructor (lotteryId) {
    this.lotteryId = lotteryId
  }

  parse (data) {
    return ''
  }

  crawl () {
    return new Promise(async (resolve, reject) => {
      try {
        const data = await new auCrawlerApi().fetchLastestResult(this.lotteryId)
        if (data && data.length > 0) {
          for (const idx in data) {
            const item = this.parse(data[idx])
            console.log(item)
            await saveLastestResult(item)
          }
        }
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }
}

module.exports = Crawler
