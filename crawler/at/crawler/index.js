/**
 * @Author: maple
 * @Date: 2020-09-06 21:49:23
 * @LastEditors: maple
 * @LastEditTime: 2020-09-18 22:24:07
 */
const VError = require('verror')
const log = require('../../../util/log')
const { newPage, ignoreImage } = require('../../../pptr')

async function crawl (defaultData = {}, { selector, date }, interpreter) {
  const {
    lotteryID,
    defaultURL
  } = defaultData

  // new page
  const page = await newPage()

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

  await page.close()

  return result
}

module.exports = crawl
