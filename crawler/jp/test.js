/**
 * 测试 Demo
 * @Author: maple
 * @Date: 2020-08-06 03:17:41
 * @LastEditors: maple
 * @LastEditTime: 2020-08-07 14:20:54
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
