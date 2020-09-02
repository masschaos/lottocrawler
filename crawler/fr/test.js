/**
 * Test Demo
 * @Author: maple
 * @Date: 2020-08-15 21:11:35
 * @LastEditors: maple
 * @LastEditTime: 2020-09-02 23:18:38
 */
const crawlers = require('./index')
const log = require('../../util/log')

async function done () {
  for (const [name, datas] of crawlers) {
    if (name !== 'fr-loto') continue
    log.debug(`%${name}%`)
    log.debug(JSON.stringify(await datas[0].crawl()))
  }
}

done()
