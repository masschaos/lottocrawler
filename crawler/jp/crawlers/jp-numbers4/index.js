/**
 * @Author: maple
 * @Date: 2020-08-05 21:18:49
 * @LastEditors: maple
 * @LastEditTime: 2020-08-07 19:25:14
 */
const VError = require('verror')
const numbersCommon = require('../common/numbers')

async function crawl (id) {
  const config = {
    mainName: 'numbers',
    name: 'numbers4',
    realName: 'ナンバーズ4',
    lotteryID: 'jp-numbers4',
    normalNumber: 4,
    specialNumber: 0
  }
  try {
    const result = await numbersCommon(config, id)
    return result
  } catch (err) {
    throw new VError(err, `${config.lotteryID}没有抓到数据，可能数据源不可用或有更改，请检查调度策略。detail: ${err.name} - ${err.message}`)
  }
}

module.exports = {
  crawl
}
