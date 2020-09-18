/**
 * @Author: maple
 * @Date: 2020-09-06 21:49:23
 * @LastEditors: maple
 * @LastEditTime: 2020-09-18 23:02:52
 */
const log = require('../../../util/log')
const { newPage, ignoreImage } = require('../../../pptr')

async function crawl (defaultData = {}, { selector, date }, interpreter, step) {
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

  if (step) {
    if (step === 'result') {
      return {
        ...result,
        breakdown: undefined,
        other: undefined
      }
    } else if (step === 'breakdown') {
      const {
        drawTime,
        breakdown
      } = result

      return {
        drawTime,
        breakdown
      }
    } else if (step === 'other') {
      return {
        drawTime: result.drawTime,
        other: result.other
      }
    }
  }

  await page.close()

  return result
}

module.exports = crawl
