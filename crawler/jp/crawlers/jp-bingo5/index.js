/**
 * @Author: maple
 * @Date: 2020-08-05 21:18:22
 * @LastEditors: maple
 * @LastEditTime: 2020-08-07 19:19:29
 */
const VError = require('verror')

const bingoCommon = require('../common/bingo')

async function crawl (id) {
  const config = {
    mainName: 'bingo',
    name: 'bingo5',
    realName: 'ビンゴ5',
    lotteryID: 'jp-bingo5',
    maxLevel: 7,
    normalNumber: 8,
    specialNumber: 0
  }
  try {
    const result = await bingoCommon(config, id)
    return result
  } catch (err) {
    throw new VError(err, `${config.lotteryID}没有抓到数据，可能数据源不可用或有更改，请检查调度策略。detail: ${err.name} - ${err.message}`)
  }
}

module.exports = {
  crawl
}
