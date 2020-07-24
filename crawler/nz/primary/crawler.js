const { getLastestResult } = require('./api')
const VError = require('verror')

const baseURL = 'https://apigw.mylotto.co.nz/api/results/v1/results/'

class Crawler {
  constructor (lotteryId) {
    this.lotteryId = lotteryId
  }

  parse (data) {
    return ''
  }

  async crawl () {
    let data = await getLastestResult(baseURL + this.lotteryId, this.lotteryId, "")
    data["jackpot"] = {}

    // 得到的结果是元素数量不少于6个的对象
    if (data && Object.keys(data).length >=6) {
      if (this.lotteryId === 'lotto') {
        console.log('=====', this.lotteryId)
        const url = 'https://apigw.mylotto.co.nz/api/content/v1/jackpotdata'
        const jackpot_data = await getLastestResult(url, this.lotteryId, '')
        console.log('jackpot==', jackpot_data)
        data['jackpot'] = jackpot_data
      }
      return this.parse(data)
    }
    throw new VError(`抓取 ${this.lotteryId} 虽未出错,但结果不符合预期:${data}`)
  }
}

module.exports = Crawler
