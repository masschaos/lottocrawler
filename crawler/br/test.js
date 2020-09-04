/**
 * @Author: maple
 * @Date: 2020-08-30 14:43:40
 * @LastEditors: maple
 * @LastEditTime: 2020-08-30 14:53:11
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
