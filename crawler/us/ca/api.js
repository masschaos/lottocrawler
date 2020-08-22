const log = require('../../../util/log')
const axios = require('axios').default
const moment = require('moment')
const API_BASE = 'https://www.calottery.com/api/DrawGameApi'

function parseMostRecentDraws (config, drawGameData) {
  const timeData = parseDrawTime(config, drawGameData)
  const mostRecentDraw = drawGameData.MostRecentDraw
  const detailsAndWinnerCount = parseDetailAndWinnerCount(config, drawGameData.MostRecentDraw)
  let jackpot = []
  if (drawGameData.NextDraw.JackpotAmount) {
    jackpot = ['$' + drawGameData.NextDraw.JackpotAmount.toLocaleString() + '*']
  }
  if (config.lotteryID === 'us_ca-daily-3' || config.lotteryID === 'us_ca-daily-4') {
    jackpot = [detailsAndWinnerCount.details[0].prize]
  }
  const result = {
    drawTime: timeData.currentDrawTime,
    nextDrawTime: timeData.nextDrawTime,
    jackpot: jackpot,
    numbers: parseWinningNumbers(config, drawGameData.MostRecentDraw),
    breakdown: [
      {
        name: 'main',
        detail: detailsAndWinnerCount.details
      }
    ],
    other: [],
    name: config.name,
    lotteryID: config.lotteryID,
    issue: `${mostRecentDraw.DrawNumber}`,
    winnerCount: detailsAndWinnerCount.winnerCount
  }
  return result
}

function parseHistoryDraws (config, previousDrawData, prevData, nextData) {
  const timeData = moment(previousDrawData.DrawDate)
  let currentDrawTime = null
  if (config.lotteryID === 'us_ca-daily-3') {
    let prevTime = null
    let nextTime = null
    if (prevData) {
      prevTime = moment(prevData.DrawDate)
      if (timeData.format('YYYYMMDD') === prevTime.format('YYYYMMDD')) {
        currentDrawTime = timeData.format('YYYYMMDD') + config.drawTime[0]
      } else {
        currentDrawTime = timeData.format('YYYYMMDD') + config.drawTime[1]
      }
    }
    if (nextData) {
      nextTime = moment(nextData.DrawDate)
      if (timeData.format('YYYYMMDD') === nextTime.format('YYYYMMDD')) {
        currentDrawTime = timeData.format('YYYYMMDD') + config.drawTime[1]
      } else {
        currentDrawTime = timeData.format('YYYYMMDD') + config.drawTime[0]
      }
    }
  } else {
    currentDrawTime = timeData.format('YYYYMMDD') + config.drawTime
  }
  const detailsAndWinnerCount = parseDetailAndWinnerCount(config, previousDrawData)
  const jackpot = [detailsAndWinnerCount.details[0].prize]
  const result = {
    drawTime: currentDrawTime,
    jackpot: jackpot,
    numbers: parseWinningNumbers(config, previousDrawData),
    breakdown: [
      {
        name: 'main',
        detail: detailsAndWinnerCount.details
      }
    ],
    other: [],
    name: config.name,
    lotteryID: config.lotteryID,
    issue: `${previousDrawData.DrawNumber}`,
    winnerCount: detailsAndWinnerCount.winnerCount
  }
  return result
}

function parseDrawTime (config, drawGameData) {
  const currentDrawTime = moment(drawGameData.MostRecentDraw.DrawDate)
  const nextDrawTime = moment(drawGameData.NextDraw.DrawDate)
  let nextDrawTimeStr = null
  let currentDrawTimeStr = null
  switch (config.lotteryID) {
    case 'us_ca-daily-4': {
      currentDrawTimeStr = currentDrawTime.format('YYYYMMDD') + config.drawTime
      nextDrawTimeStr = currentDrawTime.add(1, 'days').format('YYYYMMDD') + config.drawTime
      break
    }
    case 'us_ca-daily-3': {
      const firstTime = moment(drawGameData.PreviousDraws[0].DrawDate)
      const secondTime = moment(drawGameData.PreviousDraws[1].DrawDate)
      if (firstTime.format('YYYYMMDD') === secondTime.format('YYYYMMDD')) {
        currentDrawTimeStr = currentDrawTime.format('YYYYMMDD') + config.drawTime[1]
        nextDrawTimeStr = currentDrawTime.add(1, 'days').format('YYYYMMDD') + config.drawTime[0]
      } else {
        currentDrawTimeStr = currentDrawTime.format('YYYYMMDD') + config.drawTime[0]
        nextDrawTimeStr = currentDrawTime.format('YYYYMMDD') + config.drawTime[1]
      }
      break
    }
    default: {
      currentDrawTimeStr = currentDrawTime.format('YYYYMMDD') + config.drawTime
      nextDrawTimeStr = nextDrawTime.format('YYYYMMDD') + config.drawTime
    }
  }
  return {
    currentDrawTime: currentDrawTimeStr,
    nextDrawTime: nextDrawTimeStr
  }
}

function parseDetailAndWinnerCount (config, drawData) {
  let winnerCount = 0
  const details = []
  const mostRecentDraw = drawData
  const keys = Object.keys(mostRecentDraw.Prizes)
  for (const key of keys) {
    const item = mostRecentDraw.Prizes[key]
    const detailItem = {
      name: item.PrizeTypeDescription,
      count: item.Count,
      prize: '$' + item.Amount.toLocaleString()
    }
    if (item.Amount === 0) {
      detailItem.prize = 'Free play'
    }
    details.push(detailItem)
    winnerCount = winnerCount + item.Count
  }
  return {
    details,
    winnerCount
  }
}

function parseWinningNumbers (config, drawData) {
  let index = 0
  const numbers = []
  const winningNumbers = drawData.WinningNumbers
  const keys = Object.keys(winningNumbers)
  for (const key of keys) {
    if (index === 0) {
      numbers.push(winningNumbers[key].Number)
    } else {
      if (winningNumbers[key].IsSpecial === false) {
        numbers.push(config.noSpecialChar)
      } else {
        numbers.push(config.specialChar)
      }
      numbers.push(winningNumbers[key].Number)
    }
    index++
  }
  return numbers.join('')
}

function wait (second) {
  const promise = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, second)
  })
  return promise
}

async function getDrawGamePastDrawResults (config, pageNumber = 1, pageSize = 20) {
  try {
    const response = await axios.get(`${API_BASE}/DrawGamePastDrawResults/${config.gameId}/${pageNumber}/${pageSize}`)
    if (response.status === 200) {
      return {
        error: null,
        data: parseMostRecentDraws(config, response.data)
      }
    } else {
      return {
        error: response.status,
        data: null
      }
    }
  } catch (error) {
    return {
      error: error,
      data: null
    }
  }
}

async function getDrawGameHistoryDrawResults (config) {
  const pageSize = 20
  const result = []
  try {
    let pageNumber = 1
    let errorCount = 0
    let historyDatas = []
    while (true) {
      const response = await axios.get(`${API_BASE}/DrawGamePastDrawResults/${config.gameId}/${pageNumber}/${pageSize}`)
      if (response.status === 200) {
        if (response.data.PreviousDraws.length === 0) {
          for (let i = 0; i < historyDatas.length; i++) {
            const item = historyDatas[i]
            const prev = historyDatas[i - 1]
            const next = historyDatas[i + 1]
            result.push(parseHistoryDraws(config, item, prev, next))
          }
          return {
            error: null,
            data: result
          }
        } else {
          log.debug(`${config.lotteryID}|page|${pageNumber}|complete`)
          historyDatas = historyDatas.concat(response.data.PreviousDraws)
          pageNumber++
          errorCount = 0
        }
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
