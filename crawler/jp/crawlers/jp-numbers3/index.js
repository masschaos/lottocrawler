/**
 * @Author: maple
 * @Date: 2020-08-05 21:18:39
 * @LastEditors: maple
 * @LastEditTime: 2020-08-07 19:25:04
 */
const VError = require('verror')
const numbersCommon = require('../common/numbers')

async function crawl (id) {
  const config = {
    mainName: 'numbers',
    name: 'numbers3',
    realName: 'ナンバーズ3',
    lotteryID: 'jp-numbers3',
    normalNumber: 3,
    specialNumber: 0
  }
  try {
    const result = await numbersCommon(config, id)
    return result
  } catch (err) {
    throw new VError(`${config.lotteryID}没有抓到数据，可能数据源不可用或有更改，请检查调度策略。detail: ${err.name} - ${err.message}`)
  }
}

module.exports = {
  crawl
}
