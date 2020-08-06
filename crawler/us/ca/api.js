
const axios = require('axios').default
const moment = require('moment')
const API_BASE = 'https://www.calottery.com/api/DrawGameApi'

function parseMostRecentDraws (config, drawGameData) {
  const timeData = parseDrawTime(config, drawGameData)
  const mostRecentDraw = drawGameData.MostRecentDraw
  const detailsAndWinnerCount = parseDetailAndWinnerCount(config, drawGameData)
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
    numbers: parseWinningNumbers(config, drawGameData),
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

function parseDetailAndWinnerCount (config, drawGameData) {
  let winnerCount = 0
  const details = []
  const mostRecentDraw = drawGameData.MostRecentDraw
  for (const key in mostRecentDraw.Prizes) {
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

function parseWinningNumbers (config, drawGameData) {
  let index = 0
  const numbers = []
  const winningNumbers = drawGameData.MostRecentDraw.WinningNumbers
  for (const key in winningNumbers) {
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

module.exports = {
  getDrawGamePastDrawResults,
  wait
}
