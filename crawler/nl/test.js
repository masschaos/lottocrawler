/**
 * @Author: maple
 * @Date: 2020-08-24 22:38:42
 * @LastEditors: maple
 * @LastEditTime: 2020-08-24 22:39:03
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
