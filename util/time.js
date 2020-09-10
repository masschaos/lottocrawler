const moment = require('moment-timezone')
const cronParser = require('cron-parser')
const VError = require('verror')

function sleep (ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms)
}

function wait (ms) {
  return new Promise(function (resolve) {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}

// convert 20201231000000 format to Date
function parseDrawTime (drawTime, tz) {
  return moment.tz(drawTime, 'YYYYMMDDhhmmss', tz)
}

// timeRules 开奖规则 cron 列表
// delay 结果延迟 分钟
// lastDrawTime 上次开奖时间
// tz 时区
function hasNewDraw (timeRules, delay, lastDrawTime, tz) {
  if (!timeRules || !lastDrawTime || !tz || timeRules.length === 0) {
    throw new VError(`解析开奖时间出错，彩票配置有误请检查。时区：(${tz})，上次开奖：(${lastDrawTime})，开奖规则：(${timeRules})。`)
  }
  for (const timeRule of timeRules) {
    if (!delay) {
      delay = 0
    }
    const currentDate = parseDrawTime(lastDrawTime, tz)
    const endDate = moment().tz(tz).add(-delay, 's')
    const cron = cronParser.parseExpression(timeRule, {
      currentDate,
      endDate,
      tz
    })
    if (cron.hasNext()) {
      return true
    }
  }
  return false
}

// 判断额外步骤的延迟条件是否就绪, drawTime 为处理中的结果的开奖时间
function isExtraReady (drawTime, delay, tz) {
  return parseDrawTime(drawTime, tz).add(delay, 's').isBefore(moment().tz(tz))
}

function wait (second) {
  const promise = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, second)
  })
  return promise
}

module.exports = {
  sleep,
  wait,
  hasNewDraw,
  isExtraReady,
  wait
}
