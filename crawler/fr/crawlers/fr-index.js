/**
 * @Author: maple
 * @Date: 2020-08-14 23:01:17
 * @LastEditors: maple
 * @LastEditTime: 2020-08-15 21:30:31
 */
/**
 * @Author: maple
 * @Date: 2020-08-14 21:29:48
 * @LastEditors: maple
 * @LastEditTime: 2020-08-15 11:51:40
 */
const VError = require('verror')
const log = require('../../../util/log')
const { newPage, ignoreImage } = require('../../../pptr')

const indexPagePath = '/jeux-de-tirage/resultats'
const mainHost = 'https://www.fdj.fr'

module.exports = async function crawl (data = {}, urlSelector, interpreter) {
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
    }
  }
}
