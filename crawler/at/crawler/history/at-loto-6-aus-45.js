/**
 * @Author: maple
 * @Date: 2020-09-17 20:28:40
 * @LastEditors: maple
 * @LastEditTime: 2020-09-18 01:31:08
 */
const { getFile, writeHistory } = require('./index')
const moment = require('moment')
const log = require('../../../../util/log')
const format = require('../format')

const lottoUrls = {
  2020: 'https://www.win2day.at/media/NN_W2D_STAT_Lotto_2020.csv',
  2019: 'https://www.win2day.at/media/NN_W2D_STAT_Lotto_2019.csv',
  2018: 'https://www.win2day.at/media/NN_W2D_STAT_Lotto_2018.csv',
  2017: 'https://www.win2day.at/media/NN_W2D_STAT_Lotto_2017.csv'
}
const lottoPlusUrls = {
  2020: 'https://www.win2day.at/media/NN_W2D_STAT_LottoPlus_2020.csv',
  2019: 'https://www.win2day.at/media/NN_W2D_STAT_LottoPlus_2019.csv',
  2018: 'https://www.win2day.at/media/NN_W2D_STAT_LottoPlus_2018.csv',
  2017: 'https://www.win2day.at/media/NN_W2D_STAT_LottoPlus_2017.csv'
}

const keys = Object.keys(lottoUrls).sort((a, b) => b - a)

async function getData () {
  const results = []
  // lotto
  for (const key of keys) {
    const url = lottoUrls[key]
    const csv = await getFile(url)
    const rows = csv.getRows()

    for (let i = 0; i < rows.length; i += 2) {
      const firstRow = rows[i]
      const nextRow = rows[i + 1]

      const data = {
        year: null,
        items: [],
        plusItems: []
      }

      // if (firstRow[0] !== '13.09.') continue

      data.year = `${firstRow[0]}${key}`
      data.items.push([...(firstRow.slice(2, 10))])
      data.items.push(firstRow[11].indexOf('JP') > -1 ? '0' : firstRow[11])
      data.items.push(firstRow[13])
      data.items.push(firstRow[15])
      data.items.push(firstRow[17])
      data.items.push(firstRow[19])
      data.items.push(firstRow[21])
      data.items.push(firstRow[23])
      data.items.push(firstRow[25])
      data.items.push(nextRow[11])
      data.items.push(nextRow[13])
      data.items.push(nextRow[15])
      data.items.push(nextRow[17])
      data.items.push(nextRow[19])
      data.items.push(nextRow[21])
      data.items.push(nextRow[23])
      data.items.push(nextRow[25])

      results.push(data)

      // for (let i = 0; i < firstRow.length; i++) {
      //   console.log(`first row id: ${i} value: ${firstRow[i]}`)
      // }

      // for (let i = 0; i < nextRow.length; i++) {
      //   console.log(`next row id: ${i} value: ${nextRow[i]}`)
      // }
    }
  }

  // lotto plus
  for (const key of keys) {
    const url = lottoPlusUrls[key]
    const csv = await getFile(url)
    const rows = csv.getRows()

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const data = results[i]
      const [, date] = row[0].split(' ')
      const year = `${date}${key}`

      if (data.year !== year) {
        log.warn(`index: ${i} lotto date: ${data.year} plus date :${year}`)
        throw new Error('参数不一致，请检查两个 csv 日期是否一致')
      }
      // if (row[0].indexOf('13.09.') < 0) continue
      data.plusItems.push([...(row.slice(2, 8))])
      data.plusItems.push(row[9])
      data.plusItems.push(row[11])
      data.plusItems.push(row[13])
      data.plusItems.push(row[15])
      data.plusItems.push(row[17])
      data.plusItems.push(row[19])
      data.plusItems.push(row[21])
      data.plusItems.push(row[23])
    }
  }
  return results
}

async function main () {
  const datas = await getData()
  const results = []
  for (const data of datas) {
    const {
      year,
      items,
      plusItems
    } = data

    const numbers = items.shift()
    const bocusNumber = numbers.pop()
    numbers.pop() // 去掉中间一位 ZZ
    const plusNumbers = plusItems.shift()

    // const firstPrize = {
    //   count: items.shift(),
    //   prize: items.shift()
    // }

    const temp = {
      drawTime: moment(year, 'DD.MM.YYYY').format('YYYYMMDD191700'),
      numbers: `${numbers.join(',')}#${bocusNumber}|${plusNumbers.join(',')}`,
      jackpot: [],
      breakdown: [
        {
          name: 'lotto',
          detail: [
            {
              name: 'Sechser',
              prize: null,
              count: null,
              countStr: 'zusätzlich zum 1. Rang der nächsten Runde'
            },
            {
              name: 'Fünfer+ZZ',
              prize: null,
              count: null,
              countStr: null
            },
            {
              name: 'Fünfer',
              prize: null,
              count: null,
              countStr: null
            },
            {
              name: 'Vierer+ZZ',
              prize: null,
              count: null,
              countStr: null
            },
            {
              name: 'Vierer',
              prize: null,
              count: null,
              countStr: null
            },
            {
              name: 'Dreier+ZZ',
              prize: null,
              count: null,
              countStr: null
            },
            {
              name: 'Dreier',
              prize: null,
              count: null,
              countStr: null
            },
            {
              name: 'Zusatzzahl allein',
              prize: null,
              count: null,
              countStr: null
            }
          ]
        },
        {
          name: 'LottoPlus',
          detail: [
            {
              name: 'Sechser',
              prize: null,
              count: null,
              countStr: null
            },
            {
              name: 'Fünfer',
              prize: null,
              count: null,
              countStr: null
            },
            {
              name: 'Vierer',
              prize: null,
              count: null,
              countStr: null
            },
            {
              name: 'Dreier',
              prize: null,
              count: null,
              countStr: null
            }
          ]
        }
      ],
      other: [
        {
          name: 'JokerDrawTime',
          value: moment(year, 'DD.MM.YYYY').format('YYYYMMDD191700')
        }
      ],
      name: 'Loto 6 aus 45',
      lotteryID: 'at-loto-6-aus-45',
      issue: ''
    }

    const lottoBreakdown = temp.breakdown[0].detail
    const lottoPlusBreakdown = temp.breakdown[1].detail

    for (let i = 0, j = 0; i < items.length; i += 2, j++) {
      const breakdown = lottoBreakdown[j]
      breakdown.countStr = items[i]
      breakdown.prize = `€ ${items[i + 1]}`
      breakdown.count = format.formatStr(items[i])
    }

    // 当 lotto 头奖没有获奖者时
    if (lottoBreakdown[0].count === 0) {
      lottoBreakdown[0].countStr = 'zusätzlich zum 1. Rang der nächsten Runde'
      lottoBreakdown[0].name = '1'
    }

    for (let i = 0, j = 0; i < plusItems.length; i += 2, j++) {
      const breakdown = lottoPlusBreakdown[j]
      breakdown.countStr = plusItems[i]
      breakdown.prize = `€ ${plusItems[i + 1]}`
      breakdown.count = format.formatStr(plusItems[i])
    }

    // 当 lottoPlus 没有头奖获奖者时
    if (lottoPlusBreakdown[0].count === 0) {
      lottoPlusBreakdown[0].countStr = 'Die Gewinnsumme wurde auf die Gewinner im nächstniedrigeren Rang aufgeteilt.'
      lottoPlusBreakdown[0].name = '1'
    }

    results.push(temp)
  }

  await writeHistory('at-loto-60-aus-45', results)
}

// main()

module.exports = main
