const VError = require('verror')
const moment = require('moment')
const util = require('util')
const axios = require('axios')
const qs = require('qs')

const baseURL = 'https://www.nationallottery.co.za'
const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
  }
})

const LotteryConfig = {
  'za-daily-lotto': {
    name: 'DAILY LOTTO',
    itemId: '396',
    controller: 'daily-lotto-history',
    gameName: 'DAILYLOTTO'
  },
  'za-lotto': {
    name: 'LOTTO',
    itemId: '265',
    controller: 'lotto-history',
    gameName: 'LOTTO'
  },
  'za-lotto-plus-1': {
    name: 'LOTTO PLUS 1',
    itemId: '270',
    controller: 'lotto-plus-1-history',
    gameName: 'LOTTOPLUS'
  },
  'za-lotto-plus-2': {
    name: 'LOTTO PLUS 2',
    itemId: '271',
    controller: 'lotto-plus-2-history',
    gameName: 'LOTTOPLUS2'
  },
  'za-pick-3': {
    name: 'PICK 3',
    itemId: '274',
    controller: 'pick-3-history',
    gameName: 'PICK3'
  },
  'za-powerball': {
    name: 'PowerBall',
    itemId: '272',
    controller: 'powerball-history',
    gameName: 'POWERBALL'
  },
  'za-powerball-plus': {
    name: 'PowerBall PLUS',
    itemId: '273',
    controller: 'powerball-plus-history',
    gameName: 'POWERBALLPLUS'
  }
}

// 需要各自爬虫实现
function getNumbers (data) {
}

function getDrawTime (data) {
  return formatDateTime(data.drawDate)
}

function getNextDrawTime (data) {
  return formatDateTime(data.nextDrawDate)
}

function getLotteryID (lotteryID) {
  return lotteryID
}

function getName (lotteryID) {
  return LotteryConfig[lotteryID].name
}

function getIssue (data) {
  return data.drawNumber
}

function getBreakDown (data, divNames) {
  if (divNames === undefined) {
    return []
  }
  const detail = divNames.map((divName, index) => {
    const seq = index + 1
    const divPayoutKey = util.format('div%sPayout', seq)
    const divWinnerKey = util.format('div%sWinners', seq)
    return {
      name: divName,
      count: data[divWinnerKey],
      prize: formatMoney(data[divPayoutKey])
    }
  })
  return [{
    name: 'main',
    detail: detail
  }]
}

function getOther (data) {
  let drawMachine = data.drawMachine
  const powerballDrawMachine = data.powerballDrawMachine
  if (powerballDrawMachine !== '' && powerballDrawMachine !== undefined) {
    drawMachine = [drawMachine, powerballDrawMachine].join('/')
  }
  drawMachine = drawMachine === undefined ? 'RNG2' : drawMachine
  return [
    { name: 'ROLLOVER AMOUNT', value: formatMoney(data.rolloverAmount) },
    { name: 'ROLLOVER NO', value: formatMoney(data.rolloverNumber) },
    { name: 'DRAW MACHINE', value: drawMachine }
  ]
}

function getSaleAmount (data) {
  return formatMoney(data.totalSales)
}

function getPoolSize (data) {
  return [formatMoney(data.totalPrizePool)]
}

function getNextPoolSize (data) {
  return []
}

function getJackpot (data) {
  return [formatMoney(data.guaranteedJackpot)]
}

function getNextJackpot (data) {
  return [formatMoney(data.estimatedJackpot)]
}

// 格式化to货币显示，强制保留2位小数, 不足补0
function formatMoney (money) {
  money = Number(parseFloat(money).toFixed(2)).toLocaleString()
  const decimals = money.split('.')[1]
  if (decimals === undefined) {
    money = money + '.00'
  } else if (decimals.length === 1) {
    money = money + '0'
  }
  return 'R' + money
}

function formatDateTime (drawDate) {
  return drawDate.replace(/\//g, '') + '000000'
}

// 解析并格式化开奖结果
function formatDrawResult (lotteryID, data, divNames) {
  const result = {}
  result.drawTime = getDrawTime(data)
  result.name = getName(lotteryID)
  result.lotteryID = getLotteryID(lotteryID)
  result.issue = getIssue(data)
  result.numbers = getNumbers(data)
  result.breakdown = getBreakDown(data, divNames)
  result.other = getOther(data)
  result.nextDrawTime = getNextDrawTime(data)
  result.saleAmount = getSaleAmount(data)
  result.poolSize = getPoolSize(data)
  result.jackpot = getJackpot(data)
  result.nextJackpot = getNextJackpot(data)
  result.nextPoolSize = getNextPoolSize(data)
  return result
}

// 获取开奖issue列表
async function getDrawIssuesByAPI (lotteryID, offset, limit, startDate, endDate) {
  offset = offset === undefined ? 0 : offset
  limit = limit === undefined ? 10 : limit
  const config = LotteryConfig[lotteryID]
  let taskType = startDate === undefined ? 'results.getViewAllURL' : 'results.getHistoricalData'
  const path = util.format('/index.php?task=%s&amp;Itemid=%s&amp;option=com_weaver&amp;controller=%s', taskType, config.itemId, config.controller)
  let data = qs.stringify({
    gameName: config.gameName,
    offset: offset,
    limit: limit,
    isAjax: true
  })
  if (startDate !== undefined) {
    taskType = 'results.getHistoricalData'
    data = data + '&startDate=' + startDate + '&endDate=' + endDate
  }
  let errMsg = ''
  try {
    const response = await api.post(path, data)
    const result = response.data
    if (result.message === 'No Record Found') {
      result.data = []
    }
    if (result.data === undefined) {
      errMsg = result.message
    } else {
      return result.data.map((item) => {
        return item.drawNumber
      })
    }
  } catch (err) {
    throw new VError(err, '网络异常')
  }
  throw new VError(errMsg)
}

// 获取开奖详情
async function getDrawDetail (lotteryID, issue) {
  const config = LotteryConfig[lotteryID]
  const path = util.format('/index.php?task=results.redirectPageURL&amp;Itemid=%s&amp;option=com_weaver&amp;controller=%s', config.itemId, config.controller)
  const data = qs.stringify({
    gameName: config.gameName,
    drawNumber: issue,
    isAjax: true
  })
  try {
    const response = await api.post(path, data)
    const result = response.data
    if (result.code === 200) {
      return result.data.drawDetails
    }
  } catch (err) {
    throw new VError(err, '网络异常')
  }
  throw new VError('源网站开奖详情接口返回异常状态码')
}

// 获取最新开奖期号
async function getLatestDrawIssue (lotteryID) {
  const result = await getDrawIssuesByAPI(lotteryID, 0, 10)
  return result[0]
}

async function getHistoryDrawIssues (lotteryID, startDate, endDate) {
  let offset = 0
  const limit = 51
  let issues = []
  if (startDate !== undefined) {
    endDate = endDate === undefined ? startDate : endDate
    startDate = moment(startDate.slice(0, 8)).format('DD/MM/YYYY')
    endDate = moment(endDate.slice(0, 8)).format('DD/MM/YYYY')
  }
  while (true) {
    const issuePage = await getDrawIssuesByAPI(lotteryID, offset, limit, startDate, endDate)
    if (issuePage.length > 0) {
      issues = issues.concat(issuePage)
    }
    offset += limit
    if (issuePage.length < limit) {
      break
    }
  }
  return issues
}

module.exports = {
  formatDrawResult,
  getLatestDrawIssue,
  getDrawDetail,
  getHistoryDrawIssues,
  formatMoney
}
