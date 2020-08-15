/**
 * Test Demo
 * @Author: maple
 * @Date: 2020-08-15 21:11:35
 * @LastEditors: maple
 * @LastEditTime: 2020-08-15 21:11:58
 */
const crawlers = require('./index')

async function done () {
  for (const [name, datas] of crawlers) {
    console.log(`%${name}%`)
    console.log(JSON.stringify(await datas[0].crawl()))
  }
}

done()
