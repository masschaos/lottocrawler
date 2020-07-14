const { fetchLastestResult } = require('./api')
const VError = require('verror')

class Crawler {
  constructor (lotteryId) {
    this.lotteryId = lotteryId
  }

  parse (data) {
    return ''
  }

  async crawl () {
    const data = await fetchLastestResult(this.lotteryId)
    // 得到的结果是个只有一个元素的列表
    if (data && data.length === 1) {
      return this.parse(data[0])
    }
    throw new VError(`抓取 ${this.lotteryId} 虽未出错,但结果不符合预期:${data}`)
  }
}

module.exports = Crawler
