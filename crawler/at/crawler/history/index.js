/**
 * @Author: maple
 * @Date: 2020-09-13 20:29:20
 * @LastEditors: maple
 * @LastEditTime: 2020-09-19 00:28:34
 */
const { request } = require('axios')
const CSVReader = require('../../../../util/CSV_READER')
const fs = require('fs')
const util = require('util')
const path = require('path')
const log = require('../../../../util/log')

const writeFile = util.promisify(fs.writeFile)
const readFile = util.promisify(fs.readFile)

const reader = new CSVReader({ separator: ';' })

function uintToString (uintArray) {
  return String.fromCharCode.apply(null, new Uint8Array(uintArray))
}

async function get (url) {
  log.info(`at crawl history ${url}`)
  const res = await request({
    method: 'GET',
    url: url,
    responseType: 'arraybuffer'
  })
  const data = res.data
  // 先转换成 Uint8Array 然后再转化成字符串。
  // 而不是直接解析成 ascii
  // 感谢 @wenjia
  const csv = reader.readCSV(uintToString(data))
  return csv
}

async function writeHistory (name, items) {
  if (typeof items === 'object') {
    items = JSON.stringify(items, ' ', 2)
  }
  const defaultPath = '../../history'
  const filename = path.join(__dirname, defaultPath, `${name}.json`)
  await writeFile(filename, items)

  log.info(`write file ${filename} success`)
}

async function readHistory (name) {
  const defaultPath = '../../history'
  const filename = path.join(__dirname, defaultPath, `${name}.json`)
  const data = await readFile(filename, { encoding: 'utf-8' })

  try {
    return JSON.parse(data)
  } catch (err) {
    log.error(err)
    return {}
  }
}

exports.getFile = get
exports.writeHistory = writeHistory
exports.readHistory = readHistory
