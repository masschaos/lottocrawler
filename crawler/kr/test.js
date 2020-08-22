/**
 * 测试 Demo
 * @Author: maple
 * @Date: 2020-08-06 03:17:41
 * @LastEditors: maple
 * @LastEditTime: 2020-08-16 04:25:40
 */
const log = require('../../util/log')
const crawlers = require('./index')

async function done () {
  for (const [name, datas] of crawlers) {
    log.debug(`%${name}%`)
    log.debug(JSON.stringify(await datas[0].crawl()))
  }
}

done()
