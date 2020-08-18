const fs = require('fs')
const util = require('util')
const path = require('path')
const moment = require('moment')

const writeFile = util.promisify(fs.writeFile)
const readFile = util.promisify(fs.readFile)

// eslint-disable-next-line
const breakdown = [{"name":"10 n°","detail":[{"name":"10","value":"1 €:10 000 €par an à vieou200 000 €cash|2 €:20 000 €par an à vieou400 000 €cash|3 €:30 000 €par an à vieou600 000 €cash|5 €:50 000 €par an à vieou1 000 000 €cash|10 €:100 000 €par an à vieou2 000 000 €cash"},{"name":"9","value":"1 €:2 000 €|2 €:4 000 €|3 €:6 000 €|5 €:10 000 €|10 €:20 000 €"},{"name":"8","value":"1 €:100 €|2 €:200 €|3 €:300 €|5 €:500 €|10 €:1 000 €"},{"name":"7","value":"1 €:10 €|2 €:20 €|3 €:30 €|5 €:50 €|10 €:100 €"},{"name":"6","value":"1 €:5 €|2 €:10 €|3 €:15 €|5 €:25 €|10 €:50 €"},{"name":"5","value":"1 €:2 €|2 €:4 €|3 €:6 €|5 €:10 €|10 €:20 €"},{"name":"0","value":"1 €:2 €|2 €:4 €|3 €:6 €|5 €:10 €|10 €:20 €"}]},{"name":"9 n°","detail":[{"name":"9","value":"1 €:2 000 €par an à vieou40 000 €cash|2 €:4 000 €par an à vieou80 000 €cash|3 €:6 000 €par an à vieou120 000 €cash|5 €:10 000 €par an à vieou200 000 €cash|10 €:20 000 €par an à vieou400 000 €cash"},{"name":"8","value":"1 €:100 €|2 €:200 €|3 €:300 €|5 €:500 €|10 €:1 000 €"},{"name":"7","value":"1 €:20 €|2 €:40 €|3 €:60 €|5 €:100 €|10 €:200 €"},{"name":"6","value":"1 €:8 €|2 €:16 €|3 €:24 €|5 €:40 €|10 €:80 €"},{"name":"5","value":"1 €:2 €|2 €:4 €|3 €:6 €|5 €:10 €|10 €:20 €"},{"name":"4","value":"1 €:1 €|2 €:2 €|3 €:3 €|5 €:5 €|10 €:10 €"},{"name":"0","value":"1 €:1 €|2 €:2 €|3 €:3 €|5 €:5 €|10 €:10 €"}]},{"name":"8 n°","detail":[{"name":"8","value":"1 €:8 000 €|2 €:16 000 €|3 €:24 000 €|5 €:40 000 €|10 €:80 000 €"},{"name":"7","value":"1 €:100 €|2 €:200 €|3 €:300 €|5 €:500 €|10 €:1 000 €"},{"name":"6","value":"1 €:20 €|2 €:40 €|3 €:60 €|5 €:100 €|10 €:200 €"},{"name":"5","value":"1 €:5 €|2 €:10 €|3 €:15 €|5 €:25 €|10 €:50 €"},{"name":"0","value":"1 €:2 €|2 €:4 €|3 €:6 €|5 €:10 €|10 €:20 €"}]},{"name":"7 n°","detail":[{"name":"7","value":"1 €:3 000 €|2 €:6 000 €|3 €:9 000 €|5 €:15 000 €|10 €:30 000 €"},{"name":"6","value":"1 €:70 €|2 €:140 €|3 €:210 €|5 €:350 €|10 €:700 €"},{"name":"5","value":"1 €:5 €|2 €:10 €|3 €:15 €|5 €:25 €|10 €:50 €"},{"name":"4","value":"1 €:2 €|2 €:4 €|3 €:6 €|5 €:10 €|10 €:20 €"}]},{"name":"6 n°","detail":[{"name":"6","value":"1 €:900 €|2 €:1 800 €|3 €:2 700 €|5 €:4 500 €|10 €:9 000 €"},{"name":"5","value":"1 €:30 €|2 €:60 €|3 €:90 €|5 €:150 €|10 €:300 €"},{"name":"4","value":"1 €:2 €|2 €:4 €|3 €:6 €|5 €:10 €|10 €:20 €"}]},{"name":"5 n°","detail":[{"name":"5","value":"1 €:80 €|2 €:160 €|3 €:240 €|5 €:400 €|10 €:800 €"},{"name":"4","value":"1 €:10 €|2 €:20 €|3 €:30 €|5 €:50 €|10 €:100 €"},{"name":"3","value":"1 €:2 €|2 €:4 €|3 €:6 €|5 €:10 €|10 €:20 €"}]},{"name":"4 n°","detail":[{"name":"4","value":"1 €:50 €|2 €:100 €|3 €:150 €|5 €:250 €|10 €:500 €"},{"name":"3","value":"1 €:5 €|2 €:10 €|3 €:15 €|5 €:25 €|10 €:50 €"}]},{"name":"3 n°","detail":[{"name":"3","value":"1 €:10 €|2 €:20 €|3 €:30 €|5 €:50 €|10 €:100 €"},{"name":"2","value":"1 €:2 €|2 €:4 €|3 €:6 €|5 €:10 €|10 €:20 €"}]},{"name":"2 n°","detail":[{"name":"2","value":"1 €:6 €|2 €:12 €|3 €:18 €|5 €:30 €|10 €:60 €"}]}]

async function lineDeal (line) {
  const result = {
    drawTime: null,
    numbers: null,
    jackpot: [],
    breakdown: breakdown,
    other: [
      {
        name: 'multiplier',
        value: null
      }
    ],
    name: 'KENO GAGNANTÀVIE',
    lotteryID: 'fr-keno-gagnantavie',
    issue: ''
  }

  const tmps = line.split(';')

  // for (let i = 0; i < tmps.length; i++) {
  //   if (tmps[i]) {
  //     console.log(i, tmps[i])
  //   }
  // }

  // date
  const dateTmps = tmps[1].split('/')
  const date = moment()
  date.set('years', parseInt(dateTmps[2]))
  date.set('months', parseInt(dateTmps[1]) - 1)
  date.set('date', parseInt(dateTmps[0]))
  result.drawTime = date.format('YYYYMMDD' + (tmps[2] === 'soir' ? '20' : '13') + '0500')

  result.numbers = `${tmps.slice(4, 24).join(',')}|${tmps[95].replace(/ /g, '')}`
  result.other[0].value = tmps[94]

  return result
}

async function main (filename) {
  const text = await readFile(path.join('csv', filename), 'utf-8')
  const lines = text.split('\n')

  console.log(`文件数量: ${lines.length - 1}`)
  const list = []
  for (const line of lines.slice(1)) {
    if (line.length < 10) continue
    const data = await lineDeal(line)
    // console.log(line)
    // console.log(data)
    // await writeFile('test.json', JSON.stringify(data, 2, ' '))
    list.push(data)
  }

  await writeFile(path.join('result', 'keno.json'), JSON.stringify(list))
}

main('keno_201811.csv')
