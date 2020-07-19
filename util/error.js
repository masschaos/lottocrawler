class SiteClosedError extends Error {
  constructor (lotteryID) {
    const message = `网站处于停业时间。彩种: ${lotteryID}`
    super(message)
    this.name = 'SiteClosedError'
  }
}

class DrawingError extends Error {
  constructor (lotteryID) {
    const message = `正在开奖中，无法获取结果。彩种: ${lotteryID}`
    super(message)
    this.name = 'DrawingError'
  }
}

module.exports = {
  SiteClosedError,
  DrawingError
}
