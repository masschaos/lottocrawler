/**
 * @Author: maple
 * @Date: 2020-08-30 14:43:40
 * @LastEditors: maple
 * @LastEditTime: 2020-08-30 15:56:17
 */
const crawlers = require('./index')
const log = require('../../util/log')
const fs = require('fs')
const util = require('util')
const path = require('path')

const writeFile = util.promisify(fs.writeFile)

const max = 100

async function done () {
  const messages = []

  for (const [name, datas] of crawlers) {
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
