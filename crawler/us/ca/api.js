
const axios = require('axios').default
const moment = require('moment')
const API_BASE = 'https://www.calottery.com/api/DrawGameApi'

function parseMostRecentDraws (drawGameData) {
  const firstDraw = drawGameData.PreviousDraws[0]
  const mostRecentDraws = drawGameData.PreviousDraws.filter(item => {
    if (item.DrawDate === firstDraw.DrawDate) {
      return true
    } else {
      return false
    }
  })
  const parseResult = mostRecentDraws.map(mostRecentDraw => {
    return parseMostRecentDraw(drawGameData, mostRecentDraw)
  })
  return parseResult
}

function parseMostRecentDraw (drawGameData, mostRecentDraw) {
  const winningNumbers = mostRecentDraw.WinningNumbers
  const numbers = []
  const details = []
  let winnerCount = 0
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
  let index = 0
  for (const key in winningNumbers) {
    if (index === 0) {
      numbers.push(winningNumbers[key].Number)
    } else {
      if (winningNumbers[key].IsSpecial === false) {
        numbers.push(',')
      } else {
        numbers.push('|')
      }
      numbers.push(winningNumbers[key].Number)
    }
    index++
  }
  const jackpot = []
  if (drawGameData.NextDraw.JackpotAmount) {
    jackpot.push('$' + drawGameData.NextDraw.JackpotAmount.toLocaleString())
  }
  const currentDrawTime = moment(mostRecentDraw.DrawDate)
  let nextDrawTime = moment(drawGameData.NextDraw.DrawDate)
  // 处理 us-ca-daily-3 us-ca-daily-4 接口返回 NextDraw.DrawDate 值为异常值的情况
  if (nextDrawTime.isValid() === false || nextDrawTime.isBefore(currentDrawTime)) {
    nextDrawTime = currentDrawTime
  }
  const result = {
    drawTime: currentDrawTime.format('YYYYMMDDHHmmss'),
    nextDrawTime: nextDrawTime.format('YYYYMMDDHHmmss'),
    jackpot: jackpot,
    numbers: numbers.join(''),
    breakdown: [
      {
        name: 'main',
        detail: details
      }
    ],
    other: [],
    issue: `${mostRecentDraw.DrawNumber}`,
    winnerCount: winnerCount
  }
  return result
}

function wait (second) {
  const promise = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, second)
  })
  return promise
}

async function getDrawGamePastDrawResults (gameId, pageNumber = 1, pageSize = 20) {
  try {
    const response = await axios.get(`${API_BASE}/DrawGamePastDrawResults/${gameId}/${pageNumber}/${pageSize}`)
    if (response.status === 200) {
      return {
        error: null,
        data: parseMostRecentDraws(response.data)
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
