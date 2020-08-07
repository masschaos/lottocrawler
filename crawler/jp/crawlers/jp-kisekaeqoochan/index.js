/**
 * @Author: maple
 * @Date: 2020-08-05 21:18:26
 * @LastEditors: maple
 * @LastEditTime: 2020-08-06 02:20:50
 */
const VError = require('verror')

const qoochanCommon = require('../common/qoochan')

async function crawl () {
  const config = {
    mainName: 'qoochan',
    name: 'kisekae-qoochan',
    realName: '着せかえクーちゃん',
    lotteryID: 'jp-kisekaeqoochan',
    maxLevel: 3,
    normalNumber: 4,
    specialNumber: 0
  }
  try {
    const result = await qoochanCommon(config)
    return result
  } catch (err) {
    throw new VError(`${config.lotteryID}没有抓到数据，可能数据源不可用或有更改，请检查调度策略。detail: ${err.name} - ${err.message}`)
  }
}

module.exports = {
  crawl
}
