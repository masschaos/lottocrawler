/**
 * @Author: maple
 * @Date: 2020-08-24 21:24:59
 * @LastEditors: maple
 * @LastEditTime: 2020-08-27 03:27:50
 */
const VError = require('verror')
const log = require('../../../util/log')
const { newPage, ignoreImage } = require('../../../pptr')

async function crawl (defaultData = {}, { selector, date }, interpreter) {
  let page
  const {
    lotteryID,
    defaultURL
  } = defaultData

  try {
    // new page
    page = await newPage()

    // 忽略图片
    await ignoreImage(page)

    let url = defaultURL

    // 其中 Eurojackpot Lucky Lotto 支持 URL 直接跳转
    if (date) {
      url = `${url}?date=${date}`
    }

    // 打开页面
    await page.goto(url)
    log.info(`nl crawl ${lotteryID} URL: ${url}`)

    // 通过 selector 跳转历史页面 -> Miljoenenspel
    if (selector) {
      await selector(page, date) // 跳转到特定的页面
    }

    // 爬取页面
    const result = await interpreter(page)
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
      log.error(err)
      // do nothing
    } finally {
    }
  }
}

module.exports = crawl
