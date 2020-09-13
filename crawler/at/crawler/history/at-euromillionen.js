/**
 * @Author: maple
 * @Date: 2020-09-13 20:52:33
 * @LastEditors: maple
 * @LastEditTime: 2020-09-14 01:49:05
 */
const _ = require('lodash')
const { getFile, writeHistroy } = require('./index')
const moment = require('moment')

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
    const otherCount = dataLine[11] === 'JP' ? null : parseInt(dataLine[11])
    const datas = []
    while (true) {
      i++
      const data = rows[i]
      if (!data || data[0] !== '') {
        break
      }
      datas.push(data)
    }

    const breakdown = []
    for (const line of datas) {
      const [, , , value, , prize] = line.filter(l => l)
      breakdown.push({
        value: parseInt(value.replace(/\./g, '')),
        prize: `€ ${prize}`
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
      jackpot: ['€ 100.000,00'],
      breakdown: [
        {
          name: 'main',
          detail: [
            {
              name: '5 Zahlen + 1 Stern',
              prize: null,
              count: null
            },
            {
              name: '5 Zahlen + 0 Sterne',
              prize: null,
              count: null
            },
            {
              name: '4 Zahlen + 2 Sterne',
              prize: null,
              count: null
            },
            {
              name: '4 Zahlen + 1 Stern',
              prize: null,
              count: null
            },
            {
              name: '3 Zahlen + 2 Sterne',
              prize: null,
              count: null
            },
            {
              name: '2 Zahlen + 2 Sterne',
              prize: null,
              count: null
            },
            {
              name: '3 Zahlen + 1 Sterne',
              prize: null,
              count: null
            },
            {
              name: '3 Zahlen + 1 Sterne',
              prize: null,
              count: null
            },
            {
              name: '3 Zahlen + 0 Sterne',
              prize: null,
              count: null
            },
            {
              name: '1 Zahl + 2 Sterne',
              prize: null,
              count: null
            },
            {
              name: '2 Zahlen + 1 Sterne',
              prize: null,
              count: null
            },
            {
              name: '2 Zahlen + 0 Sterne',
              prize: null,
              count: null
            }
          ]
        }
      ],
      other: [{
        name: 'Europot, zusätzlich zum 1. Rang der nächsten Runde',
        value: null
      }],
      name: 'EuroMillionen',
      lotteryID: 'at-euromillionen',
      issue: ''
    }

    for (let i = 0; i < breakdown.length; i++) {
      data.breakdown[0].detail[i].count = breakdown[i].value
      data.breakdown[0].detail[i].prize = breakdown[i].prize
    }

    data.other[0].value = otherValue

    if (otherCount !== null) {
      data.other[0].name = '5 Zahlen + 2 Sterne'

      // 如果 5 + 2 不需要加到 breakdown，删除以下代码
      data.breakdown[0].detail.unshift({
        name: '5 Zahlen + 2 Sterne',
        prize: otherValue,
        count: otherCount
      })
    }

    jsonResults.push(data)
  }

  await writeHistroy('at-euromillionen', _.sortBy(jsonResults, 'drawTime'))
}

// main()

module.exports = main
