/**
 * @Author: maple
 * @Date: 2020-09-06 10:13:40
 * @LastEditors: maple
 * @LastEditTime: 2020-09-10 23:22:58
 */
const crawlers = require('./index')
const log = require('../../util/log')
const fs = require('fs')
const path = require('path')

const argvs = process.argv
let writeFiles = false
if (argvs[1] === 'true' || argvs[2] === 'true') {
  writeFiles = true
}

if (writeFiles) {
  try {
    fs.mkdirSync(path.join(__dirname, 'history', 'test'))
  } catch (err) {

  }
}

async function done () {
  for (const [name, datas] of crawlers) {
    log.debug(`%${name}%`)
    const result = await datas[0].crawl()
    log.debug(JSON.stringify(result))

    if (writeFiles) {
      const filename = path.join(__dirname, 'history', 'test', `${name}.json`)
      const text = JSON.stringify(result, ' ', 2)
      fs.writeFileSync(filename, text)
    }
  }
}

done()
