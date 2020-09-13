/**
 * @Author: maple
 * @Date: 2020-09-13 09:25:38
 * @LastEditors: maple
 * @LastEditTime: 2020-09-13 23:14:21
 */
const path = require('path')
const util = require('util')
const fs = require('fs')
const CSV = require('./CSV')

const readFile = util.promisify(fs.readFile)
// const writeFile = util.promisify(fs.writeFile)

class CSVReader {
  constructor (options = {}) {
    this._options = options

    this.csvData = (typeof options.csv === 'string' ? options.csv : '').trim() // csv 文件
    this.csvInit = !!this.csvInit // 是否 csv 已填充
    this.execFilePath = options.execFilePath // 执行文件的目录，用于读取文件和写入文件用
    this.separator = options.separator || ',' // 分隔符
    this.exportSeparator = options.exportSeparator || ','
    this.bufferFormat = options.bufferFormat
    this.csvEncodingFormat = options.csvEncodingFormat
  }

  _stacks () {
    const stacks = (new Error()).stack.split('\n').map(s => s.trim())
    const paths = []
    for (let i = 1; i < stacks.length; i++) {
      const text = stacks[i]
      const p = text.indexOf('(')

      if (p < 0) {
        continue
      }

      const file = text.slice(p + 1, text.length - 1)
      const tmp = file.split(':')
      const charsAt = tmp.pop()
      const rowsAt = tmp.pop()
      const fullPath = tmp.join(':')
      paths.push(Object.assign(path.parse(fullPath), { charsAt, rowsAt, fullPath }))
    }
    return paths
  }

  _isColon (word) {
    return word === '"' || word === '\''
  }

  _dealLine (text) {
    const items = []
    const colonStack = []

    let tmp = ''

    for (let i = 0; i < text.length; i++) {
      const word = text[i]
      if (this._isColon(word)) {
        const last = colonStack.pop()
        if (last !== word) {
          colonStack.push(last)
          tmp += word
        }
        continue
      }

      if (colonStack.length === 0 && word === this.separator) {
        items.push(tmp.trim())
        tmp = ''
        continue
      }
      tmp += word
    }
    items.push(tmp.trim())
    return items
  }

  readCSV (csvText) {
    // let titlesLength // title length
    // let maxLength // max length
    // let rowsNumber // rows number
    // let titles // titles
    // let rows // rows

    const _rows = csvText.split('\n').map(s => s.trim()).filter(s => s)
    const titles = this._dealLine(_rows.shift())
    const titlesLength = titles.length
    let maxLength = titles.length

    const rows = _rows.map(row => this._dealLine(row))
      .filter(row => row.length)
    rows.forEach(row => {
      if (row.length > maxLength) {
        maxLength = row.length
      }
      return row
    })

    const rowsNumber = rows.length

    const data = {
      titlesLength,
      maxLength,
      rowsNumber,
      titles,
      rows
    }
    const csv = new CSV(data, { separator: this.exportSeparator })
    return csv
  }

  async readCSVByPath (filePath, options = {}) {
    let { encoding = 'utf8' } = options

    let basePath = this.execFilePath
    if (!this.basePath && ['/', '\\'].indexOf(filePath) < 0) {
      const paths = this._stacks()
      basePath = paths[2].dir
    }

    const csvBuffer = await readFile(path.resolve(basePath, filePath))
    if (encoding !== 'binary' || !this.bufferFormat) {
      if (encoding === 'binary') {
        encoding = 'utf8'
      }
      return this.readCSV(csvBuffer.toString(encoding))
    }
    return this.readCSV(this.bufferFormat(csvBuffer))
  }
}

module.exports = CSVReader
