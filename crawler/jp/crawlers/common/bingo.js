/**
 * Bingo 类别的爬虫
 * https://www.mizuhobank.co.jp/retail/takarakuji/bingo/index.html
 * @Author: maple
 * @Date: 2020-08-05 21:18:36
 * @LastEditors: maple
 * @LastEditTime: 2020-08-07 14:15:39
 */
const crawler = require('./crawler')
const { moneyFormat } = require('../../../../util/format')
const dateDeal = require('./issue_and_draw_time')

function formatDetail (lines) {
  const line = lines[0]
  const tmps = line.split(',')

  if (tmps.length < 3 || (isNaN(parseInt(tmps[1])) && tmps[1] !== '該当なし')) {
    return []
  }
  return lines.map(line => {
    const tmps = line.split(',')
    return {
      name: tmps[0], // 确认是否需要额外处理
      count: tmps[1] === '該当なし' ? 0 : parseInt(tmps[1]),
      prize: tmps[2] === '該当なし' ? '該当なし' : `${moneyFormat(tmps[2])}円`
    }
  })
}

function format (text, config = {}) {
  const {
    realName = 'ロト7',
    lotteryID = 'jp-loto7',
    maxLevel = 6
  } = config

  const result = {
    drawTime: null,
    numbers: '',
    jackpot: [],
    breakdown: [

    ],
    other: [

    ],
    name: realName,
    lotteryID: lotteryID,
    issue: null,
    saleAmount: null
  }

  const lines = text.split('\n').map(line => line.trim()).filter(line => line)

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line[0] === '第') {
      const data = dateDeal(line)
      result.issue = data.issue
      result.drawTime = data.drawTime
      continue
    }
    if (line.indexOf('ビンゴ５抽せん数字') === 0) {
      const tmp = line.split(',').filter(num => !isNaN(parseInt(num)) && num.length === 2)
      result.numbers = tmp.join('|')
      continue
    }
    if (line.indexOf('１等') === 0) {
      const details = formatDetail(lines.slice(i, i + maxLevel))

      i += (maxLevel - 1)
      if (details.length) {
        result.breakdown.push({
          name: 'main',
          detail: details
        })

        const otherPrize = lines[i + 1]
        if (otherPrize) {
          const tmps = otherPrize.split(',')
          if (tmps[0] !== '販売実績額' && !isNaN(parseInt(tmps[1]))) {
            i++
            result.other.push({
              name: tmps[0],
              value: `${moneyFormat(tmps[1])}円`
            })
          }
        }
      }
    }
    if (line.indexOf('販売実績額') === 0) {
      const tmp = line.split(',')
      result.saleAmount = `${moneyFormat(parseInt(tmp[1]))}円`
    }
  }
  return result
}

async function main (config = {}) {
  const {
    mainName = 'loto',
    name = 'loto7'
  } = config

  const text = await crawler(name, mainName)
  const result = format(text, config)

  return result
}

module.exports = main
