const { DrawingError } = require("../util/error")

function checkDrawResult (drawResult) {
  for (let item of drawResult.breakdown) {
    if (item.detail.length === 0) {
      throw new DrawingError()
    }
  }
}

module.exports = {
    checkDrawResult
}
