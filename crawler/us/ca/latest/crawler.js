const API = require('../api')
const VError = require('verror')
function createCrawler (config) {
  return {
    crawl: async () => {
      const result = await API.retry(async () => {
        const crawlerResult = await API.getDrawGamePastDrawResults(config)
        return crawlerResult
      }, 3)
      if (result.error === null) {
        return result.data
      } else {
        throw new VError(result.error, `${config.lotteryID} 获取最新结果出错`)
      }
    },

    history: async () => {
      const result = await API.retry(async () => {
        const crawlerResult = await API.getDrawGameHistoryDrawResults(config)
        return crawlerResult
      }, 3)
      if (result.error === null) {
        return result.data
      } else {
        throw new VError(result.error, `${config.lotteryID} 获取历史结果出错`)
      }
    }
  }
}

module.exports = {
  createCrawler
}
