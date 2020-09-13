/**
 * @Author: maple
 * @Date: 2020-09-13 20:29:20
 * @LastEditors: maple
 * @LastEditTime: 2020-09-14 00:14:21
 */
const { request } = require('axios')
const CSVReader = require('../../../../util/CSV_READER')
const fs = require('fs')
const util = require('util')
const path = require('path')
const log = require('../../../../util/log')

const writeFile = util.promisify(fs.writeFile)

const reader = new CSVReader({ separator: ';' })

async function get (url) {
  log.info(`at crawl history ${url}`)
  const res = await request({
    method: 'GET',
    url: url
  })
  const data = res.data
  const csv = reader.readCSV(data)
  return csv
}

async function writeHistroy (name, items) {
  if (typeof items === 'object') {
    items = JSON.stringify(items, ' ', 2)
  }
  const defaultPath = '../../history'
  const filename = path.join(defaultPath, `${name}.json`)
  await writeFile(filename, items)

  log.info(`write file ${filename} success`)
}

exports.getFile = get
exports.writeHistroy = writeHistroy
