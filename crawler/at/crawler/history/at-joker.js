/**
 * @Author: maple
 * @Date: 2020-09-13 20:52:33
 * @LastEditors: maple
 * @LastEditTime: 2020-09-14 01:52:26
 */
const _ = require('lodash')
const { getFile, writeHistroy } = require('./index')
const moment = require('moment')

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

        if (tmp1.indexOf('JP') > -1) {
          tmp1 = 0
        }
        data.breakdown.push({
          count: parseInt(tmp1),
          value: `€ ${tmp3}`
        })
        i += 2
      } else {
        if (!row[i]) continue
        data.breakdown.push({
          count: parseInt(row[i].replace(/\./g, ''))
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
              name: '1',
              prize: '€ 8.800,00',
              count: null
            },
            {
              name: '1',
              prize: '€ 880,00',
              count: null
            },
            {
              name: '1',
              prize: '€ 88,00',
              count: null
            },
            {
              name: '1',
              prize: '€ 8,00',
              count: null
            },
            {
              name: '1',
              prize: '€ 1,80',
              count: null
            }
          ]
        }
      ],
      other: [
        {
          name: 'Doppel Jackpot, zusätzlich zum 1. Rang der nächsten Runde',
          value: null
        }
      ],
      name: 'Joker',
      lotteryID: 'at-joker',
      issue: ''
    }

    const firstItem = breakdown.shift()

    for (let i = 0; i < breakdown.length; i++) {
      data.breakdown[0].detail[i].count = breakdown[i].count
    }

    data.other[0].value = firstItem.value

    if (firstItem.count > 0) {
      // 添加一等奖到 breakdown
      // 如果不需要，删掉这段代码
      data.breakdown[0].detail.unshift({
        name: '1',
        prize: firstItem.value,
        count: firstItem.count
      })

      data.other[0].name = `${firstItem.count} Joker`
    }

    jsonResults.push(data)
  }

  await writeHistroy('at-joker', _.sortBy(jsonResults, 'drawTime'))
}

// main()

module.exports = main
