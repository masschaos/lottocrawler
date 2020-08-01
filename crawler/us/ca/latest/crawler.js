
const API = require('../api')
const VError = require('verror')
function createCrawler (gameId, config) {
  return {
    crawl: async () => {
      let result = await API.getDrawGamePastDrawResults(gameId)
      if (result.error) {
        await API.wait(5000) // retry 1
        result = await API.getDrawGamePastDrawResults(gameId)
      }
      if (result.error) {
        await API.wait(5000) // retry 2
        result = await API.getDrawGamePastDrawResults(gameId)
      }
      if (result.error === null) {
        result.data = result.data.map(item => {
          return Object.assign(config, item)
        })
        return result.data
      } else {
        throw new VError(result.error, `${config.lotteryId} 获取最新结果出错`)
      }
    }
  }
}

module.exports = {
  createCrawler
}
