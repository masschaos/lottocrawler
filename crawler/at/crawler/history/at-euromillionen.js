/**
 * @Author: maple
 * @Date: 2020-09-13 20:52:33
 * @LastEditors: maple
 * @LastEditTime: 2020-09-18 03:33:57
 */
const _ = require('lodash')
const { getFile, writeHistory } = require('./index')
const moment = require('moment')
const format = require('../format')

const urlData = {
  2020: 'https://www.win2day.at/media/NN_W2D_STAT_EUML_2020.csv',
  2019: 'https://www.win2day.at/media/NN_W2D_STAT_EUML_2019.csv',
  2018: 'https://www.win2day.at/media/NN_W2D_STAT_EUML_2018.csv',
  2017: 'https://www.win2day.at/media/NN_W2D_STAT_EUML_2017.csv'
}

const keys = Object.keys(urlData).sort((a, b) => b - a)

async function deal (year, url) {
  const csv = await getFile(url)
  const rows = csv.getRows()
  const results = []
  for (let i = 0; i < rows.length;) {
    const dataLine = rows[i]
    const [, dateText] = dataLine[0].split(' ')
    const numbers = `${dataLine.slice(1, 6).join(',')}|${dataLine[6]},${dataLine[7]}`
    const otherValue = `€ ${dataLine[13]}`
    const otherCount = dataLine[11] === 'JP' ? '0' : dataLine[11] // 特等奖的获奖情况在第一行 JP 表示未有获奖者
    const datas = []
    while (true) {
      // 循环的方式去获得其他 breakdown
      i++
      const data = rows[i]
      if (!data || data[0] !== '') { // 奖项的第一个(其实是好几个) item 是空字符串， 用来判断是否结束
        break
      }
      datas.push(data)
    }

    const breakdown = []
    for (const line of datas) {
      const [, , , value, , prize] = line.filter(l => l) // 若干个数值，取自己需要的
      breakdown.push({
        countStr: value,
        prize: `€ ${prize}` // 奖项加上货币符号
      })
    }
    const data = {
      numbers,
      breakdown,
      dateText,
      otherValue,
      otherCount
    }
    results.push(data)
  }
  return results
}

async function main () {
  let results = []
  for (const key of keys) {
    const datas = await deal(key, urlData[key])
    results = results.concat(datas)
  }

  const jsonResults = []

  for (const item of results) {
    const { numbers, breakdown, dateText, otherValue, otherCount } = item
    const data = {
      drawTime: moment(dateText, 'DD.MM.YYYY').format('YYYYMMDD222500'), // '20200828222500',
      numbers: numbers,
      jackpot: ['€ 100.000,00'], // 这个数据不变
      breakdown: [
        {
          name: 'main',
          detail: [
            {
              name: '5 Zahlen + 2 Stern',
              prize: null,
              count: null,
              countStr: null
            },
            {
              name: '5 Zahlen + 1 Stern',
              prize: null,
              count: null,
              countStr: null
            },
            {
              name: '5 Zahlen + 0 Sterne',
              prize: null,
              count: null,
              countStr: null
            },
            {
              name: '4 Zahlen + 2 Sterne',
              prize: null,
              count: null,
              countStr: null
            },
            {
              name: '4 Zahlen + 1 Stern',
              prize: null,
              count: null,
              countStr: null
            },
            {
              name: '3 Zahlen + 2 Sterne',
              prize: null,
              count: null,
              countStr: null
            },
            {
              name: '2 Zahlen + 2 Sterne',
              prize: null,
              count: null,
              countStr: null
            },
            {
              name: '3 Zahlen + 1 Sterne',
              prize: null,
              count: null,
              countStr: null
            },
            {
              name: '3 Zahlen + 1 Sterne',
              prize: null,
              count: null,
              countStr: null
            },
            {
              name: '3 Zahlen + 0 Sterne',
              prize: null,
              count: null,
              countStr: null
            },
            {
              name: '1 Zahl + 2 Sterne',
              prize: null,
              count: null,
              countStr: null
            },
            {
              name: '2 Zahlen + 1 Sterne',
              prize: null,
              count: null,
              countStr: null
            },
            {
              name: '2 Zahlen + 0 Sterne',
              prize: null,
              count: null,
              countStr: null
            }
          ]
        }
      ],
      other: [], // other 木有数据
      name: 'EuroMillionen',
      lotteryID: 'at-euromillionen',
      issue: ''
    }
    // breakdwon 写入
    for (let i = 0; i < breakdown.length; i++) {
      data.breakdown[0].detail[i + 1].countStr = `${breakdown[i].countStr}-mal`
      data.breakdown[0].detail[i + 1].count = format.formatStr(breakdown[i].countStr)
      data.breakdown[0].detail[i + 1].prize = breakdown[i].prize
    }

    data.breakdown[0].detail[0].prize = otherValue
    data.breakdown[0].detail[0].countStr = `${otherCount} Joker`
    data.breakdown[0].detail[0].count = parseInt(otherCount)

    if (parseInt(otherCount) === 0) {
      data.breakdown[0].detail[0].name = '1'
      data.breakdown[0].detail[0].countStr = 'Europot, zusätzlich zum 1. Rang der nächsten Runde'
    }
    if (data.breakdown[0].detail[1].count === 0) {
      data.breakdown[0].detail[1].name = '2'
      data.breakdown[0].detail[1].prize = '' // 二等奖 count 0 不会显示数值
      data.breakdown[0].detail[1].countStr = 'Europot, zusätzlich zum 1. Rang der nächsten Runde'
    }

    jsonResults.push(data)
  }

  await writeHistory('at-euromillionen', _.sortBy(jsonResults, 'drawTime'))
}

// main()

module.exports = main
