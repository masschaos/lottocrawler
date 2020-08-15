/**
 * @Author: maple
 * @Date: 2020-08-16 04:27:15
 * @LastEditors: maple
 * @LastEditTime: 2020-08-16 05:39:38
 */
const VError = require('verror')
const log = require('../../../util/log')
const { newPage, ignoreImage } = require('../../../pptr')

const mainHost = 'https://dhlottery.co.kr/gameResult.do?method='

async function crawl (data = {}, method, interpreter) {
  let page
  const {
    lotteryID
  } = data

  try {
    // 建立一个新 page
    page = await newPage()

    // 忽略图片爬取
    await ignoreImage(page)

    // 打开页面
    await page.goto(mainHost + method)

    // 爬取
    const result = await interpreter(page) || {}
    if (!result) {
      throw new VError('result is empty!')
    }
    return result
  } catch (err) {
    log.error(err)
    throw new VError(`<${lotteryID}> 没有抓到数据，可能数据源不可用或有更改，请检查调度策略
    detail: ${err.name} - ${err.message}`)
  } finally {
    try {
      await page.close()
    } catch (err) {
      console.error(err)
      // do nothing
    } finally {
      // process.exit(0)
    }
  }
}

module.exports = crawl
