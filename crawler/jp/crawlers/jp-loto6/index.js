/**
 * @Author: maple
 * @Date: 2020-08-05 21:18:29
 * @LastEditors: maple
 * @LastEditTime: 2020-08-07 19:24:40
 */
const VError = require('verror')
const lotoCommon = require('../common/loto')

async function crawl (id) {
  const config = {
    mainName: 'loto',
    name: 'loto6',
    realName: 'ロト6',
    lotteryID: 'jp-loto6',
    maxLevel: 5,
    normalNumber: 6,
    specialNumber: 1
  }
  try {
    const result = await lotoCommon(config, id)
    return result
  } catch (err) {
    throw new VError(`${config.lotteryID}没有抓到数据，可能数据源不可用或有更改，请检查调度策略。detail: ${err.name} - ${err.message}`)
  }
}

module.exports = {
  crawl
}
