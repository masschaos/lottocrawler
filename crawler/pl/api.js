
const axios = require('axios').default
const moment = require('moment')
const log = require('../../util/log')
const API_BASE = 'https://www.lotto.pl/api'

function parseMostRecentDraws (config, drawGameData, drawProzesData) {
  const timeData = parseDrawTime(config, drawGameData)
  const result = {
    drawTime: timeData.currentDrawTime,
    jackpot: [],
    numbers: parseWinningNumbers(config, drawGameData),
    breakdown: parseBreakdown(config, drawGameData, drawProzesData),
    other: parseOther(config, drawGameData),
    name: config.name,
    lotteryID: config.lotteryID,
    issue: `${drawGameData.drawSystemId}`
  }
  return result
}

function parseHistoryDraws (config, drawGameData) {
  const timeData = parseDrawTime(config, drawGameData)
  const result = {
    drawTime: timeData.currentDrawTime,
    jackpot: [],
    numbers: parseWinningNumbers(config, drawGameData),
    other: parseOther(config, drawGameData),
    name: config.name,
    lotteryID: config.lotteryID,
    issue: `${drawGameData.drawSystemId}`
  }
  return result
}

function parseDrawTime (config, drawGameData) {
  const currentDrawTime = moment.utc(drawGameData.drawDate)
  const currentDrawTimeStr = currentDrawTime.format('YYYYMMDDHHmm00')
  return {
    currentDrawTime: currentDrawTimeStr
  }
}

function parseBreakdown (config, drawData, drawPrizesData) {
  switch (config.gameId) {
    case 'Lotto':
    case 'MiniLotto':
    case 'SuperSzansa':
    case 'EkstraPensja':
    case 'Kaskada': {
      const breakdown = []
      for (const item of drawPrizesData) {
        if (config.breakdown[item.gameType]) {
          const breakdownConfig = config.breakdown[item.gameType]
          const breakdownItem = {
            name: breakdownConfig.name,
            detail: []
          }
          for (const index in item.prizes) {
            if (Object.prototype.hasOwnProperty.call(item.prizes, index)) {
              breakdownItem.detail.push({
                name: breakdownConfig.detail[index],
                count: item.prizes[index].prize,
                prize: formatPrizeValue(item.prizes[index].prizeValue)
              }
              )
            }
          }
          breakdown.push(breakdownItem)
        }
      }
      return breakdown
    }
    case 'MultiMulti': {
      return parseBreakdownMultiMulti(config, drawData, drawPrizesData)
    }
    case 'EuroJackpot': {
      return parseBreakdownEuroJackpot(config, drawData, drawPrizesData)
    }
  }
}

function parseBreakdownMultiMulti (config, drawData, drawPrizesData) {
  const breakdown = []
  const dataTemplate = [
    ['37', '', '', '', '', '', '', '', '', ''],
    ['99', '', '', '', '', '', '', '', '', ''],
    ['36', '30', '', '', '', '', '', '', '', ''],
    ['98', '89', '', '', '', '', '', '', '', ''],
    ['35', '29', '24', '', '', '', '', '', '', ''],
    ['97', '88', '80', '', '', '', '', '', '', ''],
    ['34', '28', '23', '19', '', '', '', '', '', ''],
    ['96', '87', '79', '72', '', '', '', '', ''],
    ['33', '27', '22', '18', '14', '', '', '', '', ''],
    ['95', '86', '78', '71', '65', '', '', '', '', ''],
    ['32', '26', '21', '17', '13', '10', '', '', '', ''],
    ['94', '85', '77', '70', '64', '59', '', '', '', ''],
    ['31', '25', '20', '16', '12', '9', '7', '', '', ''],
    ['93', '84', '76', '69', '63', '58', '54', '', '', ''],
    ['-', '-', '-', '15', '11', '8', '6', '4', '', ''],
    ['92', '83', '75', '68', '62', '57', '53', '50', '', ''],
    ['-', '-', '-', '-', '-', '-', '5', '3', '2', ''],
    ['91', '82', '74', '67', '61', '56', '52', '49', '47', ''],
    ['-', '-', '-', '-', '-', '-', '-', '-', '-', '1'],
    ['90', '81', '73', '66', '60', '55', '51', '48', '46', '45']
  ]
  const valueMap = drawPrizesData[0].prizes
  const breakdownItem = {
    name: 'Liczba wygranych',
    detail: {
      twoDimensionalList: []
    }
  }
  for (const row of dataTemplate) {
    // console.log(row, row.length)
    for (let i = 0, l = row.length; i < l; i++) {
      if (row[i] !== '' && row[i] !== '-') {
        row[i] = valueMap[row[i]] + ''
        // if (row[i].length > 3) {
        //   row[i] = row[i].substring(0, row[i].length - 3) + ' ' + row[i].substring(row[i].length - 3, row[i].length)
        // }
      }
    }
    breakdownItem.detail.twoDimensionalList.push({
      value: row
    })
  }
  breakdown.push(breakdownItem)
  return breakdown
}

function parseBreakdownEuroJackpot (config, drawData, drawPrizesData) {
  const prizesMap = {
    1: 'I (5+2)',
    2: 'II (5+1)',
    3: 'III (5+0)',
    4: 'IV (4+2)',
    5: 'V (4+1)',
    6: 'VI (4+0)',
    7: 'VII (3+2)',
    8: 'VIII (2+2)',
    9: 'IX (3+1)',
    10: 'X (3+0)',
    11: 'XI (1+2)',
    12: 'XII (2+1)'
  }
  const countriesPrizesMap = {
    2: 'II (5+1)',
    3: 'III (5+0)'
  }
  const prizeBreakdown = {
    name: 'Wygrane w Polsce',
    detail: []
  }
  for (const key in drawPrizesData[0].prizes) {
    if (Object.prototype.hasOwnProperty.call(drawPrizesData[0].prizes, key)) {
      const prize = drawPrizesData[0].prizes[key]
      prizeBreakdown.detail.push({
        name: prizesMap[key],
        count: prize.prize,
        prize: formatPrizeValue(prize.prizeValue)
      })
    }
  }
  const countriesPrizesBreakdown = {
    name: 'Najwyższe wygrane w losowaniu',
    detail: []
  }
  for (const prize of drawPrizesData[0].countriesPrizes) {
    const countries = prize.prizesValues.map(item => {
      return item.country
    })
    const prizeValue = prize.prizesValues[0].prizeValue
    countriesPrizesBreakdown.detail.push({
      name: countriesPrizesMap[prize.degree],
      count: prize.countWinners,
      country: countries.join('|'),
      prize: formatPrizeValue(prizeValue)
    })
  }
  return [
    prizeBreakdown, countriesPrizesBreakdown
  ]
}

function parseOther (config, drawData) {
  const other = []
  if (config.gameId !== 'SuperSzansa') {
    for (const item of drawData.results) {
      if (item.gameType === 'SuperSzansa') {
        other.push({
          name: 'SuperSzansaIssue',
          value: item.drawSystemId ? `${item.drawSystemId}` : null
        })
        other.push({
          name: 'SuperSzansaDrawTime',
          value: moment.utc(item.drawDate).format('YYYYMMDDHHmm00')
        })
        break
      }
    }
  }
  return other
}

function formatPrizeValue (prizeValue) {
  return parseFloat(prizeValue).toFixed(2).replace('.', ',') + 'zł'
}

function parseWinningNumbers (config, drawData) {
  const breakdownNameList = Object.keys(config.breakdown)
  const numbers = []
  for (const drawItemData of drawData.results) {
    if (breakdownNameList.includes(drawItemData.gameType)) {
      if (config.gameId === 'MultiMulti') {
        drawItemData.resultsJson = drawItemData.resultsJson.concat(drawItemData.specialResults)
      }
      if (config.gameId !== 'SuperSzansa') {
        drawItemData.resultsJson.sort((a, b) => a - b)
      }

      numbers.push(drawItemData.resultsJson.join(config.noSpecialChar))
      if (drawItemData.specialResults.length > 0) {
        drawItemData.specialResults.sort((a, b) => a - b)
        numbers.push(drawItemData.specialResults.join(config.specialChar))
      }
    }
  }
  return numbers.join('|')
}

function wait (second) {
  const promise = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, second)
  })
  return promise
}

async function getDrawPrizes (drawData) {
  let url = null
  switch (drawData.gameType) {
    case 'MultiMulti': {
      url = `${API_BASE}/lotteries/draw-prizes/multimulti?drawSystemId=${drawData.drawSystemId}`
      break
    }
    case 'EuroJackpot': {
      url = `${API_BASE}/lotteries/draw-prizes/eurojackpot?drawSystemId=${drawData.drawSystemId}`
      break
    }
    default: {
      url = `${API_BASE}/lotteries/draw-prizes?drawType=${drawData.gameType}&drawSystemId=${drawData.drawSystemId}`
    }
  }
  const response = await axios.get(url)
  return response.data
}

async function getDrawGamePastDrawResults (config, pageNumber = 1, pageSize = 10) {
  try {
    const url = `${API_BASE}/lotteries/draw-results/by-gametype?game=${config.gameId}&index=${pageNumber}&size=${pageSize}&sort=drawDate&order=DESC`

    const response = await axios.get(url)
    // console.log('getDrawGamePastDrawResults', response.status)
    if (response.status === 200) {
      // console.log(response.data)
      if (response.data && response.data.code === 200 && response.data.items[0]) {
        const items = response.data.items.filter(item => {
          return !!item.drawSystemId
        })
        const drawData = items[0]
        const drawProzesData = await getDrawPrizes(drawData)
        return {
          error: null,
          data: parseMostRecentDraws(config, drawData, drawProzesData)
        }
      } else {
        return {
          error: JSON.stringify(response.data),
          data: null
        }
      }
    } else {
      return {
        error: response.status,
        data: null
      }
    }
  } catch (error) {
    // console.log(error)
    return {
      error: error,
      data: null
    }
  }
}

async function getDrawGameHistoryDrawResults (config) {
  const pageSize = 10
  const result = []
  try {
    let pageNumber = 1
    let errorCount = 0
    while (true) {
      const url = `${API_BASE}/lotteries/draw-results/by-gametype?game=${config.gameId}&index=${pageNumber}&size=${pageSize}&sort=drawDate&order=DESC`
      const response = await axios.get(url)
      if (response.status === 200) {
        if (response.data.items.length > 0) {
          log.info(`${config.lotteryID}|page|${pageNumber}|complete`)
          for (const item of response.data.items) {
            result.push(parseHistoryDraws(config, item))
          }
          if (result.length >= 100) {
            log.info(`${config.lotteryID}|All|complete`)
            return {
              error: null,
              data: result
            }
          }
        } else {
          log.debug(`${config.lotteryID}|All|complete`)
          return {
            error: null,
            data: result
          }
        }
        pageNumber++
      } else {
        errorCount++
      }
      if (errorCount > 5) {
        // 抓取某页数据错误次数超过5次，则认为出现异常，直接返回
        return {
          error: response.status,
          data: []
        }
      }
      await wait(5000) // 加入延迟，防止破坏对方网站
    }
  } catch (error) {
    return {
      error: error,
      data: []
    }
  }
}
async function retry (func, retryCount) {
  let count = 0
  while (true) {
    const result = await func()
    if (result.error) {
      await wait(5000)
    } else {
      return result
    }
    count++
    if (count >= retryCount) {
      return result
    }
  }
}
module.exports = {
  getDrawGamePastDrawResults,
  getDrawGameHistoryDrawResults,
  wait,
  retry
}
