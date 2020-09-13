const VError = require('verror')
/**
 * @Author: maple
 * @Date: 2020-09-13 20:52:33
 * @LastEditors: maple
 * @LastEditTime: 2020-09-14 01:49:15
 */
const _ = require('lodash')
const { getFile, writeHistroy } = require('./index')
const moment = require('moment')

const urlData = {
  2020: 'https://www.win2day.at/media/NN_W2D_STAT_Zahlenlotto_2020.csv',
  2019: 'https://www.win2day.at/media/NN_W2D_STAT_Zahlenlotto_2019.csv',
  2018: 'https://www.win2day.at/media/NN_W2D_STAT_Zahlenlotto_2018.csv',
  2017: 'https://www.win2day.at/media/NN_W2D_STAT_Zahlenlotto_2017.csv'
}

const keys = Object.keys(urlData).sort((a, b) => b - a)

async function deal (year, url) {
  const csv = await getFile(url)
  const rows = csv.getRows()
  let total = []
  for (const row of rows) {
    total = total.concat(row)
  }
  total = total.filter(t => t.trim())

  const result = []
  let data
  for (const item of total) {
    if (item.indexOf('.') > -1) {
      if (data !== undefined) {
        // 第一个不需要 push
        result.push(data)
        data = {
          year: null,
          items: []
        }
      }

      if (data === undefined) {
        data = {
          year: null,
          items: []
        }
      }

      data.year = `${item}${year}`
      continue
    }
    data.items.push(item)
  }

  result.push(data)
  return result
}

async function main () {
  let results = []
  for (const key of keys) {
    const datas = await deal(key, urlData[key])
    for (const data of datas) {
      if (!data.year) {
        throw new VError(`year 缺失; data: ${JSON.stringify(data)}`)
      }

      if (data.items.length !== 5) {
        throw new VError(`item 数量缺失; data: ${JSON.stringify(data)}`)
      }
      results = results.concat(datas)
    }
  }

  const jsonResults = []

  for (const item of results) {
    const { year, items } = item
    const data = {
      drawTime: moment(year, 'DD.MM.YYYY').format('YYYYMMDD000000'),
      numbers: items.join(','),
      jackpot: [],
      breakdown: [],
      other: [],
      name: 'Zahlenlotto',
      lotteryID: 'at-zahlenlotto',
      issue: ''
    }
    jsonResults.push(data)
  }

  await writeHistroy('at-zahlenlotto', _.sortBy(jsonResults, 'drawTime'))
}

// main()

module.exports = main
