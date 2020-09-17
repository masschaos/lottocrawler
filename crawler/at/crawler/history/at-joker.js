/**
 * @Author: maple
 * @Date: 2020-09-13 20:52:33
 * @LastEditors: maple
 * @LastEditTime: 2020-09-17 20:25:58
 */
const _ = require('lodash')
const moment = require('moment')

const { getFile, writeHistroy } = require('./index')
const format = require('../format')

const urlData = {
  2020: 'https://www.win2day.at/media/NN_W2D_STAT_Joker_2020.csv',
  2019: 'https://www.win2day.at/media/NN_W2D_STAT_Joker_2019.csv',
  2018: 'https://www.win2day.at/media/NN_W2D_STAT_Joker_2018.csv',
  2017: 'https://www.win2day.at/media/NN_W2D_STAT_Joker_2017.csv'
}

const keys = Object.keys(urlData).sort((a, b) => b - a)

async function deal (year, url) {
  const csv = await getFile(url)
  const rows = csv.getRows()
  const results = []
  for (const row of rows) {
    const data = {
      year: null,
      numbers: null,
      breakdown: []
    }
    const [, dateText] = row[0].split(' ')
    data.year = `${dateText}${year}`
    data.numbers = row.slice(1, 7).map(s => parseInt(s)).join('|')

    for (let i = 7; i < row.length; i++) {
      if (i === 7) {
        let tmp1 = row[i]
        const tmp3 = row[i + 2]

        // 特等奖是 7,8,9 位
        // 其中 7 位可能为 JPx 表示未有中奖者
        if (tmp1.indexOf('JP') > -1) {
          tmp1 = '0'
        }
        data.breakdown.push({
          count: tmp1,
          value: tmp3
        })
        i += 2
      } else {
        // 除了特等奖，其他奖项只有获奖人数
        if (!row[i]) continue
        data.breakdown.push({
          count: row[i] // parseInt(row[i].replace(/\./g, '')) // 替换人数中的 xx.xx 中的 .
        })
      }
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
    const { year, numbers, breakdown } = item
    const data = {
      drawTime: moment(year, 'DD.MM.YYYY').format('YYYYMMDD184000'),
      numbers: numbers,
      jackpot: [],
      breakdown: [
        {
          name: 'main',
          detail: [
            {
              name: '2',
              prize: '€ 8.800,00',
              countStr: null,
              count: null
            },
            {
              name: '3',
              prize: '€ 880,00',
              countStr: null,
              count: null
            },
            {
              name: '4',
              prize: '€ 88,00',
              countStr: null,
              count: null
            },
            {
              name: '5',
              prize: '€ 8,00',
              countStr: null,
              count: null
            },
            {
              name: '6',
              prize: '€ 1,80',
              countStr: null,
              count: null
            }
          ]
        }
      ],
      other: [
        // {
        //   name: 'Doppel Jackpot, zusätzlich zum 1. Rang der nächsten Runde',
        //   value: null
        // }
      ],
      name: 'Joker',
      lotteryID: 'at-joker',
      issue: ''
    }

    const firstItem = breakdown.shift() // 特等奖拿出来单独处理

    // 第二个到第六个奖项
    for (let i = 0; i < breakdown.length; i++) {
      data.breakdown[0].detail[i].count = format.formatStr(breakdown[i].count)
      data.breakdown[0].detail[i].countStr = `${breakdown[i].count}-mal`
    }

    // 头奖
    data.breakdown[0].detail.unshift({
      name: '1',
      prize: firstItem.value,
      countStr: parseInt(firstItem.count) > 0 ? `${firstItem.count} Joker`
        : 'Doppel Jackpot, zusätzlich zum 1. Rang der nächsten Runde',
      count: parseInt(firstItem.count) // 头奖应该不会超过 1000 吧
    })

    jsonResults.push(data)
  }

  await writeHistroy('at-joker', _.sortBy(jsonResults, 'drawTime'))
}

// main()

module.exports = main
