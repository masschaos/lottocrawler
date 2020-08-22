/**
 * Test Demo
 * @Author: maple
 * @Date: 2020-08-15 21:11:35
 * @LastEditors: maple
 * @LastEditTime: 2020-08-15 21:11:58
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
