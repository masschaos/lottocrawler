/**
 * @Author: maple
 * @Date: 2020-09-06 21:49:23
 * @LastEditors: maple
 * @LastEditTime: 2020-09-10 22:57:33
 */
const VError = require('verror')
const log = require('../../../util/log')
const { newPage, ignoreImage } = require('../../../pptr')
const { DrawingError } = require('../../../util/error')

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

    const url = defaultURL

    // 打开页面
    await page.goto(url)
    log.info(`at crawl ${lotteryID} URL: ${url}`)

    // 爬取页面
    const result = await interpreter(page)
    if (!result) {
      throw new VError('result is empty!')
    }
    return result
  } catch (err) {
    if (err instanceof DrawingError) {
      throw err
    } else {
      throw new VError(err, `<${lotteryID}> 没有抓到数据，可能数据源不可用或有更改，请检查调度策略
      detail: ${err.name} - ${err.message}`)
    }
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
