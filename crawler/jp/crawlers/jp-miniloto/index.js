/**
 * @Author: maple
 * @Date: 2020-08-05 21:18:36
 * @LastEditors: maple
 * @LastEditTime: 2020-08-07 19:24:56
 */
const VError = require('verror')
const lotoCommon = require('../common/loto')

async function crawl (id) {
  const config = {
    mainName: 'loto',
    name: 'miniloto',
    realName: 'ミニロト',
    lotteryID: 'jp-miniloto',
    maxLevel: 4,
    normalNumber: 5,
    specialNumber: 1
  }
  try {
    const result = await lotoCommon(config, id)
    return result
  } catch (err) {
    throw new VError(err, `${config.lotteryID}没有抓到数据，可能数据源不可用或有更改，请检查调度策略。detail: ${err.name} - ${err.message}`)
  }
}

module.exports = {
  crawl
}
