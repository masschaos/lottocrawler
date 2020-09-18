/**
 * @Author: maple
 * @Date: 2020-08-14 23:01:17
 * @LastEditors: maple
 * @LastEditTime: 2020-09-18 23:09:06
 */
const log = require('../../../util/log')
const { newPage, ignoreImage } = require('../../../pptr')
const { DrawingError } = require('../../../util/error')
const indexPagePath = '/jeux-de-tirage/resultats'
const mainHost = 'https://www.fdj.fr'

module.exports = async function crawl (data = {}, urlSelector, interpreter, step) {
  // 建立一个新 page
  const page = await newPage()

  // 忽略图片爬取
  await ignoreImage(page)

  // 爬取目录
  await page.goto(`${mainHost}${indexPagePath}`)
  const url = await urlSelector(page)
  log.info(`crawl ${data.lotteryID} URL: ${url}`)
  data.url = url

  // 打开页面
  await page.goto(url)

  // 爬取
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

      if (breakdown.length === 0 ||
        !breakdown[0].detail ||
        breakdown[0].detail.length === 0) {
        throw new DrawingError(`${data.lotteryID} breakdown is empty`)
      }

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
