
const axios = require('axios').default
const moment = require('moment')
const log = require('../../util/log')
const INFO_BASE = 'https://www.svenskaspel.se'
const API_BASE = 'https://api.www.svenskaspel.se'
function parseMostRecentDraws (config, drawGameData) {
  const timeData = parseDrawTime(config, drawGameData)
  const result = {
    drawTime: timeData.currentDrawTime,
    jackpot: parseJackpot(config, drawGameData),
    numbers: parseWinningNumbers(config, drawGameData),
    breakdown: parseBreakdown(config, drawGameData),
    other: parseOther(config, drawGameData),
    name: config.name,
    lotteryID: config.lotteryID,
    issue: `${drawGameData.resultData.result.drawNumber}`
  }
  switch (config.gameId) {
    case 'keno': {
      result.winnerCount = parseWinnerCountKeno(config, drawGameData)
      break
    }
    case 'lotto': {
      result.winnerCount = parseWinnerCountLotto(config, drawGameData)
      break
    }
  }
  return result
}

function parseHistoryDraws (config, drawGameData) {
  const timeData = parseDrawTime(config, drawGameData)
  const result = {
    drawTime: timeData.currentDrawTime,
    jackpot: parseJackpot(config, drawGameData),
    numbers: parseWinningNumbers(config, drawGameData),
    other: parseOther(config, drawGameData),
    name: config.name,
    lotteryID: config.lotteryID,
    issue: `${drawGameData.resultData.result.drawNumber}`
  }
  switch (config.gameId) {
    case 'keno': {
      result.winnerCount = parseWinnerCountKeno(config, drawGameData)
      break
    }
    case 'lotto': {
      result.winnerCount = parseWinnerCountLotto(config, drawGameData)
      break
    }
  }
  return result
}

function parseDrawTime (config, drawGameData) {
  const currentDrawTime = moment(drawGameData.resultData.result.regCloseTime.split('T')[0], 'YYYY-MM-DD')
  let currentDrawTimeStr = currentDrawTime.format('YYYYMMDD')
  switch (config.gameId) {
    case 'lotto': {
      if (currentDrawTime.isoWeekday() === 6) {
        currentDrawTimeStr = currentDrawTimeStr + '195500'
      } else {
        currentDrawTimeStr = currentDrawTimeStr + '182500'
      }
      break
    }
    case 'keno': {
      if (currentDrawTime.isoWeekday() === 6 || currentDrawTime.isoWeekday() === 7) {
        currentDrawTimeStr = currentDrawTimeStr + '175500'
      } else {
        currentDrawTimeStr = currentDrawTimeStr + '185000'
      }
      break
    }
    case 'eurojackpot': {
      currentDrawTimeStr = currentDrawTimeStr + '230000'
      break
    }
    case 'vikinglotto': {
      currentDrawTimeStr = currentDrawTimeStr + '180000'
      break
    }
  }
  return {
    currentDrawTime: currentDrawTimeStr
  }
}

function parseJackpot (config, drawData) {
  const jackpotInfo = drawData.jackpotInfo
  for (const item of jackpotInfo.items) {
    if (item.id === 'spel') {
      for (const jackpotItem of item.items) {
        if (jackpotItem.product === config.gameId && jackpotItem.jackpot.length === 1) {
          return [
            jackpotItem.jackpot[0].jackpotAmountString
          ]
        }
      }
    }
  }
  return []
}

function parseBreakdown (config, drawData) {
  switch (config.gameId) {
    case 'lotto': {
      return parseBreakdownLotto(config, drawData)
    }
    case 'keno': {
      return parseBreakdownKeno(config, drawData)
    }
    case 'eurojackpot': {
      return parseBreakdownEurojackpot(config, drawData)
    }
    case 'vikinglotto': {
      return parseBreakdownVikinglotto(config, drawData)
    }
  }
}

function parseBreakdownLotto (config, drawData) {
  const breakdown = []
  const distribution = drawData.resultData.result.distribution
  const addonResult = drawData.resultData.addonResult
  for (let i = 0, l = distribution.length; i < l; i++) {
    const item = distribution[i]
    const breakdownItem = {
      name: `Lotto ${i + 1}`,
      detail: []
    }
    for (const detailItem of item.distribution) {
      breakdownItem.detail.push({
        name: detailItem.name,
        count: detailItem.winners,
        prize: formatPrizeValue(detailItem.amount)
      })
    }
    breakdown.push(breakdownItem)
  }
  const addonBreakdown = {
    name: 'joker',
    detail: []
  }
  for (const detailItem of addonResult.distribution) {
    addonBreakdown.detail.push({
      name: detailItem.name,
      count: detailItem.winners,
      prize: formatPrizeValue(detailItem.amount)
    })
  }
  breakdown.push(addonBreakdown)
  return breakdown
}
function parseWinnerCountKeno (config, drawData) {
  let winnerCount = 0
  const distributionRegular = drawData.resultData.result.distributionRegular
  for (const distributionRegularItem of distributionRegular) {
    for (const distribution of distributionRegularItem.distribution) {
      winnerCount = winnerCount + distribution.winners
    }
  }
  const distributionKungKeno = drawData.resultData.result.distributionKungKeno
  for (const distributionKungKenoItem of distributionKungKeno) {
    for (const distribution of distributionKungKenoItem.distribution) {
      winnerCount = winnerCount + distribution.winners
    }
  }
  return winnerCount
}

function parseWinnerCountLotto (config, drawData) {
  let winnerCount = 0
  const distribution = drawData.resultData.result.distribution
  const addonResult = drawData.resultData.addonResult
  for (let i = 0, l = distribution.length; i < l; i++) {
    const item = distribution[i]
    for (const detailItem of item.distribution) {
      winnerCount = winnerCount + detailItem.winners
    }
  }
  for (const detailItem of addonResult.distribution) {
    winnerCount = winnerCount + detailItem.winners
  }
  return winnerCount
}

function parseBreakdownKeno (config, drawData) {
  const breakdown = []
  const distributionRegular = drawData.resultData.result.distributionRegular
  for (const distributionRegularItem of distributionRegular) {
    const breakdownItem = {
      name: `UTDELNING KENO-${distributionRegularItem.name}`,
      detail: []
    }
    for (const distribution of distributionRegularItem.distribution) {
      breakdownItem.detail.push({
        name: distribution.name,
        count: distribution.winners,
        prize: formatPrizeValue(distribution.amount)
      })
    }
    breakdown.push(breakdownItem)
  }
  const distributionKungKeno = drawData.resultData.result.distributionKungKeno
  for (const distributionKungKenoItem of distributionKungKeno) {
    const breakdownItem = {
      name: `UTDELNING KUNG KENO-${distributionKungKenoItem.name}`,
      detail: []
    }
    for (const distribution of distributionKungKenoItem.distribution) {
      breakdownItem.detail.push({
        name: distribution.name,
        count: distribution.winners,
        prize: formatPrizeValue(distribution.amount)
      })
    }
    breakdown.push(breakdownItem)
  }
  return breakdown
}

function parseBreakdownEurojackpot (config, drawData) {
  const breakdown = []
  const breakdownItem = {
    name: 'eurojackpot',
    detail: []
  }
  const swedenDistribution = drawData.resultData.result.distribution[0]
  const nameMap = {}
  for (const distribution of swedenDistribution.distribution) {
    let item = null
    if (distribution.name === '5 rätt + 2' && parseInt(distribution.amount) === 0) {
      item = {
        name: distribution.name,
        count: distribution.winners,
        prize: 'Jackpot'
      }
    } else {
      item = {
        name: distribution.name,
        count: distribution.winners,
        prize: formatPrizeValue(distribution.amount)
      }
    }
    nameMap[distribution.name] = item
    breakdownItem.detail.push(item)
  }
  const internationalDistribution = drawData.resultData.result.distribution[1]
  for (const distribution of internationalDistribution.distribution) {
    if (nameMap[distribution.name]) {
      nameMap[distribution.name].Internationellt = distribution.winners
    }
  }
  breakdown.push(breakdownItem)
  return breakdown
}

function parseBreakdownVikinglotto (config, drawData) {
  const breakdown = []
  const breakdownItem = {
    name: 'main',
    detail: []
  }
  const addonResult = drawData.resultData.addonResult
  const swedenDistribution = drawData.resultData.result.distribution[0]
  const nameMap = {}
  for (const distribution of swedenDistribution.distribution) {
    let item = null
    if (distribution.name === '6 rätt + 1' && parseInt(distribution.amount) === 0) {
      item = {
        name: distribution.name,
        count: distribution.winners,
        prize: 'Jackpot',
        Internationellt: '-'
      }
    } else {
      item = {
        name: distribution.name,
        count: distribution.winners,
        prize: formatPrizeValue(distribution.amount),
        Internationellt: '-'
      }
    }
    nameMap[distribution.name] = item
    breakdownItem.detail.push(item)
  }
  const internationalDistribution = drawData.resultData.result.distribution[1]
  for (const distribution of internationalDistribution.distribution) {
    if (nameMap[distribution.name]) {
      nameMap[distribution.name].Internationellt = distribution.winners + ' st'
    }
  }
  breakdown.push(breakdownItem)
  const addonBreakdown = {
    name: 'joker',
    detail: []
  }
  for (const detailItem of addonResult.distribution) {
    addonBreakdown.detail.push({
      name: detailItem.name,
      count: detailItem.winners,
      prize: formatPrizeValue(detailItem.amount)
    })
  }
  breakdown.push(addonBreakdown)
  return breakdown
}

function formatNum (num) {
  return parseFloat(num).toString().replace(/(\d)(?=(\d{3})+$)/g, '$1 ')
}

function getTotalPayout (distribution) {
  let totalPayout = 0
  for (let i = 0, len = distribution.length; i < len; i++) {
    totalPayout += distribution[i].winners * parseInt(distribution[i].amount, 10)
  }
  return totalPayout
}

function parseOther (config, drawData) {
  const other = []
  switch (config.gameId) {
    case 'lotto': {
      const distribution = drawData.resultData.result.distribution
      const addonResult = drawData.resultData.addonResult
      other.push({
        name: 'Totalt', value: ''.concat(formatNum(getTotalPayout(distribution[0].distribution) + getTotalPayout(distribution[1].distribution) + getTotalPayout(addonResult.distribution)), ' kr')
      })
      other.push({
        name: 'Ingen Drömvinst denna dragning', value: `Nu uppe i ${parseJackpot(config, drawData)[0]}`
      })
      break
    }
    case 'vikinglotto': {
      const distribution = drawData.resultData.result.distribution
      other.push({
        name: 'Totalt', value: ''.concat(formatNum(getTotalPayout(distribution[0].distribution)), ' kr')
      })
    }
  }
  return other
}

function formatPrizeValue (prizeValue) {
  return formatNum(prizeValue) + ' kr'
}

function parseWinningNumbers (config, drawData) {
  const numbers = []
  switch (config.gameId) {
    case 'lotto':
    case 'vikinglotto': {
      const drawResult = drawData.resultData.result.drawResult
      const addonResult = drawData.resultData.addonResult.drawResult
      for (const drawItem of drawResult) {
        numbers.push(`${drawItem.drawNumbers[0].numbers.join(',')}|${drawItem.drawNumbers[1].numbers.join(',')}`)
      }
      numbers.push(addonResult.numbers.join('|'))
      break
    }
    case 'eurojackpot': {
      const drawResult = drawData.resultData.result.drawResult
      numbers.push(`${drawResult[0].numbers.join(',')}#${drawResult[1].numbers.join(',')}`)
      break
    }
    case 'keno': {
      const drawResult = drawData.resultData.result
      numbers.push(`${drawResult.numbers.join(',')}|${drawResult.kungKenoNumber.join(',')}`)
      break
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

function parseResponseData (config, response) {
  const resultDataRegex = new RegExp(`_svs\\.${config.templateId}\\.data\\.resultData={(.*)};`, 'gm')
  const jackpotInfoRegex = new RegExp('_cmps\\.data\\.navigation={(.*)};', 'gm')
  const resultDataMatchResult = resultDataRegex.exec(response.data)
  const drawData = {}
  if (resultDataMatchResult.length === 2) {
    drawData.resultData = JSON.parse(`{${resultDataMatchResult[1]}}`)
  }
  const jackpotInfoMatchResult = jackpotInfoRegex.exec(response.data)
  if (jackpotInfoMatchResult.length === 2) {
    drawData.jackpotInfo = JSON.parse(`{${jackpotInfoMatchResult[1]}}`)
  }
  return drawData
}

async function getDrawGamePastDrawResults (config) {
  try {
    const url = `${INFO_BASE}/${config.gameId}/resultat`
    const response = await axios.get(url)
    if (response.status === 200) {
      const drawData = parseResponseData(config, response)
      if (drawData.resultData && drawData.jackpotInfo) {
        return {
          error: null,
          data: parseMostRecentDraws(config, drawData)
        }
      } else {
        return {
          error: `${config.gameId} parse data error`,
          data: null
        }
      }
    } else {
      return {
        error: `response.status ${response.status}`,
        data: null
      }
    }
  } catch (error) {
    return {
      error: `${error}`,
      data: null
    }
  }
}

async function getDrawGameHistoryDrawResults (config) {
  const now = moment()
  const result = []
  try {
    const resultMap = {}
    while (true) {
      const month = now.month() + 1
      const year = now.year()
      const url = `${API_BASE}/multifetch?urls=/draw%2Fresults%2Fdatepicker%3Fproduct%3D${config.gameId}%26year%3D${year}%26month%3D${month}`
      const response = await axios.get(url)
      if (response.status === 200) {
        if (response.data && response.data.responses && response.data.responses[0]) {
          for (const dateItem of response.data.responses[0].resultDates.reverse()) {
            const date = dateItem.date.split('T')[0]
            if (resultMap[date] === true) {
              continue
            }
            const infoUrl = `${INFO_BASE}/${config.gameId}/resultat/${date}`
            const infoResponse = await axios.get(infoUrl)
            if (infoResponse.status === 200) {
              const drawData = parseResponseData(config, infoResponse)
              if (drawData.resultData && drawData.jackpotInfo) {
                result.push(parseHistoryDraws(config, drawData))
                resultMap[date] = true
                log.info(`${config.gameId}|${year}|${month}|${date}|success`)
              }
            }
            await wait(8000) // 加入延迟，防止破坏对方网站
          }
          now.subtract(1, 'months')
        }
      }
      if (result.length >= 100) {
        return {
          error: null,
          data: result
        }
      }
    }
  } catch (error) {
    return {
      error: `${error}`,
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
