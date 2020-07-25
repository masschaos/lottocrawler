const { DrawingError } = require('../util/error')

function checkDrawResult (lotteryID, drawResult) {
  for (const item of drawResult.breakdown) {
    if (item.detail.length === 0) {
      throw new DrawingError(lotteryID)
    }
  }
}

module.exports = {
  checkDrawResult
}
