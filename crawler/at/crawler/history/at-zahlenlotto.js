const VError = require('verror')
/**
 * @Author: maple
 * @Date: 2020-09-13 20:52:33
 * @LastEditors: maple
 * @LastEditTime: 2020-09-18 22:47:55
 */
const _ = require('lodash')
const { getFile, writeHistory } = require('./index')
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
    // 这个彩种的 csv 并不是一行行来的，而是若干次奖项连续的存入到一行里
    // 所以直接把所有的数值都组合到一个大数组进行处理
    total = total.concat(row)
  }
  total = total.filter(t => t.trim())

  const result = []
  let data
  for (const item of total) {
    if (item.indexOf('.') > -1) { // 参数包含 . 表示是个日期项
      if (data !== undefined) { // 第一次遇到日期不需要 push
        // 除了第一次，其他都 push data & 初始化 data
        result.push(data)
        data = {
          year: null,
          items: []
        }
      }

      // 初始化 data
      if (data === undefined) {
        data = {
          year: null,
          items: []
        }
      }

      data.year = `${item}${year}` // 写入日期
      continue
    }
    data.items.push(item) // 接下来若干个数值都是 Numbers
  }

  result.push(data)
  return result
}

async function main () {
  let csvAllDatas = []
  for (const key of keys) {
    const datas = await deal(key, urlData[key])
    for (const data of datas) {
      // 检查数据是否缺失
      if (!data.year) {
        throw new VError(`year 缺失; data: ${JSON.stringify(data)}`)
      }

      if (data.items.length !== 5) {
        throw new VError(`item 数量缺失; data: ${JSON.stringify(data)}`)
      }
    }
    // 把所有的 datas 放到一个数组里
    csvAllDatas = csvAllDatas.concat(datas)
  }

  const jsonResults = []

  for (const lottoDate of csvAllDatas) {
    const { year, items } = lottoDate
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

  await writeHistory('at-zahlenlotto', _.sortBy(jsonResults, 'drawTime'))
}

// main()

module.exports = main
