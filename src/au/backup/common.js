const auLottoConfig = require('../auLottoConfig')
const util = require('./util')

function assembleFormatData (originData) {
  const lotteryID = originData.lotteryID
  let drawTime = originData.drawTime
  const issue = originData.issue
  const numbers = originData.numbers
  let detail = originData.detail
  detail = detail.map(item => {
    item.Winners = Number(item.Winners.replace(',', ''))
    return item
  })
  const lotteryName = auLottoConfig.AuLottoIDConfig[lotteryID]
  const jackpot = detail.slice(0, 1)
  const other = detail.slice(1)
  drawTime = util.dateFormatter(drawTime)

  const data = {
    drawTime: drawTime,
    detail: detail,
    jackpot: jackpot,
    other: other,
    issue: issue,
    numbers: numbers,
    name: lotteryName,
    lotteryID: lotteryID
  }
  return [data]
}

module.exports = {
  assembleFormatData
}
