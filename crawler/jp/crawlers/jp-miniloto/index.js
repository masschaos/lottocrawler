/**
 * @Author: maple
 * @Date: 2020-08-05 21:18:36
 * @LastEditors: maple
 * @LastEditTime: 2020-08-06 02:22:49
 */
const VError = require('verror')
const lotoCommon = require('../common/loto')

async function crawl () {
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
    const result = await lotoCommon(config)
    return result
  } catch (err) {
    throw new VError(`${config.lotteryID}没有抓到数据，可能数据源不可用或有更改，请检查调度策略。detail: ${err.name} - ${err.message}`)
  }
}

module.exports = {
  crawl
}
