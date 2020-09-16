/**
 * @Author: maple
 * @Date: 2020-09-06 10:13:40
 * @LastEditors: maple
 * @LastEditTime: 2020-09-16 19:47:58
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
    // if (name !== 'at-lucky-day') continue

    log.debug(`%${name}%`)
    let result
    try {
      result = await datas[0].crawl()
    } catch (err) {
      log.error(err.stack)
      continue
    }

    log.debug(JSON.stringify(result))

    if (writeFiles) {
      const filename = path.join(__dirname, 'history', 'test', `${name}.json`)
      const text = JSON.stringify(result, ' ', 2)
      fs.writeFileSync(filename, text)
      log.debug(`写入文件: ${filename}`)
    }
  }
}

done()
