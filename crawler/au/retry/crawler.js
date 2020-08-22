const { auCrawlerApi: AuCrawlerApi, saveLastestResult } = require('../../../util/api')
const log = require('../../../util/log')
class auCrawler {
  constructor (lotteryId) {
    this.lotteryId = lotteryId
  }

  parse (data) {
    return ''
  }

  async crawl () {
    const data = await new AuCrawlerApi().fetchDrawRangeResult(this.lotteryId, process.env.DRAW_NO)
    if (data && data.length > 0) {
      const idxs = Object.keys(data)
      for (const idx of idxs) {
        const item = this.parse(data[idx])
        log.debug(item)
        await saveLastestResult(item)
      }
    }
  }
}

module.exports = auCrawler
