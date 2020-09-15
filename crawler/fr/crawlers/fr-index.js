/**
 * @Author: maple
 * @Date: 2020-08-14 23:01:17
 * @LastEditors: maple
 * @LastEditTime: 2020-09-02 22:38:01
 */
const VError = require('verror')
const log = require('../../../util/log')
const { newPage, ignoreImage } = require('../../../pptr')
const { DrawingError } = require('../../../util/error')
const indexPagePath = '/jeux-de-tirage/resultats'
const mainHost = 'https://www.fdj.fr'

module.exports = async function crawl (data = {}, urlSelector, interpreter, step) {
  let page
  const {
    lotteryID
  } = data

  try {
    // 建立一个新 page
    page = await newPage()

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
    if (!result) {
      throw new VError('result is empty!')
    }

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

    return result
  } catch (err) {
    throw new VError(err, `<${lotteryID}> 没有抓到数据，可能数据源不可用或有更改，请检查调度策略
    detail: ${err.name} - ${err.message}`)
  } finally {
    try {
      await page.close()
    } catch (err) {
      log.error(err)
      // do nothing
    }
  }
}
