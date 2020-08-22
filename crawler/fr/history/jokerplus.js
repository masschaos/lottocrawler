/**
 * @Author: maple
 * @Date: 2020-08-16 01:43:47
 * @LastEditors: maple
 * @LastEditTime: 2020-08-16 02:28:33
 */
const fs = require('fs')
const util = require('util')
const path = require('path')
// const moment = require('moment')

// const writeFile = util.promisify(fs.writeFile)
const readFile = util.promisify(fs.readFile)

// async function init (filename, is2019 = true) {
//   const text = await readFile(path.join('csv', filename), 'utf-8')
//   const lines = text.split('\n')
//   lines.shift()
//   // log.debug(lines[0], lines[1])
//   for (const line of lines) {
//     const tmps = line.split(';').map(s => s.trim())
//     log.debug(tmps)
//     if (tmps.length < 2) continue

//     const dateTmps = tmps[is2019 ? 2 : 1].split('/')
//     const date = moment()
//     date.set('years', parseInt(dateTmps[2]))
//     date.set('months', parseInt(dateTmps[1]) - 1)
//     date.set('date', parseInt(dateTmps[0]))
//     const filename = path.join('csv', 'jokerplus', date.format('YYYY-MM-DD'))
//     let data
//     try {
//       data = await readFile(filename, { encoding: 'utf-8' })
//     } catch (err) {}
//     const value = tmps[is2019 ? 5 : 4].replace(' ', '').replace(' ', '')
//     if (data && data.split(',').indexOf(value) < 0) {
//       await writeFile(filename, `${data},${value}`)
//     } else {
//       await writeFile(filename, value)
//     }
//   }
// }

// (async function () {
//   await init('jokerplus_201902.csv')
//   await init('jokerplus.csv', false)
// })()

async function joker (date) {
  const filename = path.join('csv', 'jokerplus', date)
  return (await readFile(filename, { encoding: 'utf-8' })).split(',')
}

exports.joker = joker

// async function test () {
//   log.debug(await joker('2020-08-12'))
// }

// test()
