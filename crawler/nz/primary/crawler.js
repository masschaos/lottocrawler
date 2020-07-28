const { getLatestResult } = require('./api')
const VError = require('verror')

const baseURL = 'https://apigw.mylotto.co.nz/api/results/v1/results/'

class Crawler {
  constructor (lotteryId) {
    this.lotteryId = lotteryId
  }

  parse (data) {
    return data
  }

  async crawl () {
    const data = await getLatestResult(baseURL + this.lotteryId, this.lotteryId, '')
    data.jackpot = {}

    // 得到的结果是元素数量不少于6个的对象
    if (data && Object.keys(data).length >= 6) {
      if (this.lotteryId === 'lotto') {
        const url = 'https://apigw.mylotto.co.nz/api/content/v1/jackpotdata'
        data.jackpot = await getLatestResult(url, this.lotteryId, '')
      }
      return this.parse(data)
    }
    throw new VError(`抓取 ${this.lotteryId} 虽未出错,但结果不符合预期:${data}`)
  }
}

module.exports = Crawler
