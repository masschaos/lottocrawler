/**
 * @Author: maple
 * @Date: 2020-08-30 14:43:40
 * @LastEditors: maple
 * @LastEditTime: 2020-08-31 22:57:03
 */
const crawlers = require('./index')
const log = require('../../util/log')
const fs = require('fs')
const util = require('util')
const path = require('path')

const writeFile = util.promisify(fs.writeFile)

const max = 100
const hasCrawled = [
  // 'br-dia-de-sorte',
  // 'br-dupla-sena',
  // 'br-loteria-federal'
]

async function done () {
  const messages = []

  for (const [name, datas] of crawlers) {
    if (hasCrawled.indexOf(name) > -1) {
      log.debug(`lotteryID: ${name} has crawled! skip!`)
      continue
    }

    log.debug(`crawl ${name} history`)
    const crawler = datas[0].crawl

    const lastItem = await crawler()
    const issue = parseInt(lastItem.issue)

    const result = []
    for (let i = issue - max + 1; i < issue + 1; i++) {
      result.push(await crawler(i))
    }

    await writeFile(path.join(__dirname, 'history', `${name}.JSON`), JSON.stringify(result, 2, ' '))
    messages.push(`${name}: scope: ${issue - max + 1} - ${issue}`)
    messages.push(result.map(r => r.issue).join(','))
    log.debug('write success')
  }

  messages.forEach(message => log.info(message))
}

done()
