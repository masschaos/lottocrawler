/**
 * 测试 Demo
 * @Author: maple
 * @Date: 2020-08-06 03:17:41
 * @LastEditors: maple
 * @LastEditTime: 2020-08-06 03:35:35
 */
const crawlers = require('./index')

async function done () {
  for (const [name, datas] of crawlers) {
    console.log(name)
    console.log(JSON.stringify(await datas[0].crawl()))
  }
}

done()
