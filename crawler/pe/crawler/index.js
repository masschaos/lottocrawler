const VError = require('verror')
const log = require('../../../util/log')
const { newPage, ignoreImage } = require('../../../pptr')
const { parse } = require('../parse')

const mainHost = 'https://www.nacionalloteria.com'

function createCrawler (config) {
  return {
    crawl: async (stepId) => {
      const result = await craw(config)
      if (result.error === null) {
        const stepData = result.data
        if (stepId === 'breakdown') {
          return {
            drawTime: stepData.drawTime,
            breakdown: stepData.breakdown
          }
        } else {
          return stepData
        }
      } else {
        throw new VError(result.error, `${config.lotteryID} 获取最新结果出错`)
      }
    }
  }
}

async function craw (data = {}) {
  const page = await newPage()
  const { lotteryID, indexPagePath } = data
  try {
    await ignoreImage(page)
    const url = `${mainHost}${indexPagePath}`
    log.info(`crawl ${data.lotteryID} URL: ${url}`)
    await page.goto(url)
    const result = await parse(page, data)
    if (!result) { throw new VError('result is empty!') }
    return result
  } catch (err) {
    throw new VError(err, `<${lotteryID}> 没有抓到数据，可能数据源不可用或有更改，请检查调度策略
        detail: ${err.name} - ${err.message}`)
  } finally {
    await page.close()
  }
}

module.exports = {
  createCrawler
}
