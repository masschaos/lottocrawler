/**
 * @Author: maple
 * @Date: 2020-09-06 10:13:40
 * @LastEditors: maple
 * @LastEditTime: 2020-09-06 10:17:21
 */
const crawlers = require('./index')
const log = require('../../util/log')

async function done () {
  for (const [name, datas] of crawlers) {
    log.debug(`%${name}%`)
    log.debug(JSON.stringify(await datas[0].crawl()))
  }
}

done()
