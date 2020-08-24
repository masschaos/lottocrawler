
const API = require('../api')
const VError = require('verror')
function checkSuperSzansaIssueIsNull (data) {
  if (data.other) {
    for (const item of data.other) {
      if (item.name === 'SuperSzansaIssue' && item.value === null) {
        return true
      }
    }
  }
  return false
}
function createCrawler (config) {
  return {
    crawl: async (stepId) => {
      const result = await API.retry(async () => {
        const crawlerResult = await API.getDrawGamePastDrawResults(config)
        return crawlerResult
      }, 3)
      if (result.error === null) {
        const stepData = result.data
        if (stepId) {
          switch (stepId) {
            case 'result': {
              delete stepData.breakdown
              delete stepData.other
              return stepData
            }
            case 'breakdown': {
              return {
                drawTime: stepData.drawTime,
                breakdown: stepData.breakdown
              }
            }
            case 'other': {
              if (checkSuperSzansaIssueIsNull(stepData)) {
                throw new VError('SuperSzansaIssue is null', `${config.lotteryID} 获取 SuperSzansaIssue 出错`)
              }
              return {
                drawTime: stepData.drawTime,
                breakdown: stepData.other
              }
            }
          }
        } else {
          if (checkSuperSzansaIssueIsNull(stepData)) {
            throw new VError('SuperSzansaIssue is null', `${config.lotteryID} 获取 SuperSzansaIssue 出错`)
          }
          return stepData
        }
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
