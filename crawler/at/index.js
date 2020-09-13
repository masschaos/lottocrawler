/**
 * @Author: maple
 * @Date: 2020-09-06 10:13:35
 * @LastEditors: maple
 * @LastEditTime: 2020-09-10 22:56:35
 */
const fs = require('fs')
const path = require('path')

const countryCode = 'at'

const filenames = fs.readdirSync(path.join(__dirname, 'crawler')).filter(file => file.indexOf(`${countryCode}-`) === 0)

const crawlers = new Map()

for (const filename of filenames) {
  const [name] = filename.split(',')
  const crawler = require(path.join(__dirname, 'crawler', name))
  crawlers.set(name, [crawler])
}

module.exports = crawlers