/**
 * @Author: maple
 * @Date: 2020-08-05 21:18:36
 * @LastEditors: maple
 * @LastEditTime: 2020-08-06 01:58:37
 */
const crawler = require('./crawler')
const moment = require('moment')
const { moneyFormat } = require('../../../../util/format')

function formatDetail (lines, number) {
  const line = lines[0]
  const tmps = line.split(',')

  if (tmps.length < 3 || (isNaN(parseInt(tmps[1])) && tmps[1] !== '該当なし')) {
    return []
  }
  return lines.map(line => {
    const tmps = line.split(',')
    if (tmps[1] === '下２ケタ' || (number && tmps[1] === number)) {
      tmps[1] = tmps[2]
      tmps[2] = tmps[3]
    }
    return {
      name: tmps[0], // 确认是否需要额外处理
      count: tmps[1] === '該当なし' ? 0 : parseInt(tmps[1]),
      prize: tmps[2] === '該当なし' ? '該当なし' : `${moneyFormat(tmps[2])}円`
    }
  })
}

function format (text, config = {}) {
  const {
    drawTime = moment().format('YYYYMMDDHHmmss'),
    realName = 'ロト7',
    lotteryID = 'jp-loto7',
    normalNumber = 3
  } = config

  const result = {
    drawTime,
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
      result.issue = parseInt(line.slice(1, 5)).toString()
    }
    if (line.indexOf('ナンバーズ') === 0) {
      const tmp = line.split(',').filter(num => !isNaN(parseInt(num)))

      if (tmp.length) {
        const number = tmp[0]
        if (number.length === normalNumber) {
          result.numbers = number.split('').join('|')

          const detailLines = []

          for (i = i + 1; i < lines.length; i++) {
            // 处理接下来的若干行

            // 到 <販売実績額> 结束
            if (lines[i].indexOf('販売実績額') === 0) {
              const tmp = lines[i].split(',')
              result.saleAmount = `${moneyFormat(parseInt(tmp[1]))}円`
              break
            }

            detailLines.push(lines[i])
          }

          const details = formatDetail(detailLines, number)
          if (details.length) {
            result.breakdown.push({
              name: 'main',
              detail: details
            })
          }
        }
      }
    }
  }
  return result
}

async function main (config = {}) {
  const {
    mainName = 'numbers',
    name = 'numbers3'
  } = config

  const drawTime = moment().format('YYYYMMDDHHmmss')
  config.drawTime = drawTime
  const text = await crawler(name, mainName)
  console.log(text)
  const result = format(text, config)

  return result
}

module.exports = main
