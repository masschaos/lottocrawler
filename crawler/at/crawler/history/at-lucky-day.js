const VError = require('verror')
/**
 * @Author: maple
 * @Date: 2020-09-13 20:52:33
 * @LastEditors: maple
 * @LastEditTime: 2020-09-18 22:52:15
 */
const _ = require('lodash')
const { getFile, writeHistory } = require('./index')
const moment = require('moment')

const urlData = {
  2020: 'https://www.win2day.at/media/NN_W2D_STAT_Lucky_Day_2020.csv',
  2019: 'https://www.win2day.at/media/NN_W2D_STAT_Lucky_Day_2019.csv'
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

  total = total.filter(t => {
    if (!t) return false
    if (t.indexOf('/') > -1) return false
    if (t === '-') return false
    return true
  })

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
  let allLottoDatas = []
  for (const key of keys) {
    const lottoDatasPerYear = await deal(key, urlData[key])
    // 检查 row 数据是否问题
    for (const data of lottoDatasPerYear) {
      if (!data.year) {
        throw new VError(`year 缺失; data: ${JSON.stringify(data)}`)
      }

      if (data.items.length !== 4) {
        throw new VError(`item 数量缺失; data: ${JSON.stringify(data)}`)
      }
    }
    // 将每年的数据聚合到一个数组里来
    allLottoDatas = allLottoDatas.concat(lottoDatasPerYear)
  }

  const jsonResults = []

  for (const item of allLottoDatas) {
    const { year, items } = item
    const data = {
      drawTime: moment(year, 'DD.MM.YYYY').format('YYYYMMDD184000'),
      numbers: items.join('|'),
      jackpot: [],
      breakdown: [],
      other: [],
      name: 'Lucky Day',
      lotteryID: 'at-lucky-day',
      issue: ''
    }
    jsonResults.push(data)
  }

  await writeHistory('at-lucky-day', _.sortBy(jsonResults, 'drawTime'))
}

// main()

module.exports = main
