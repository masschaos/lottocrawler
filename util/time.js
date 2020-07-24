const moment = require('moment-timezone')
const cronParser = require('cron-parser')
const VError = require('verror')

function sleep (ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms)
}

// convert 20201231000000 format to Date
function parseDrawTime (drawTime, tz) {
  return moment.tz(drawTime, 'YYYYMMDDhhmmss', tz)
}

// timeRules 开奖规则 cron 列表
// isQuickDraw 是否快开 高于1天每次就算
// delay 结果延迟 分钟
// lastDrawTime 上次开奖时间
// tz 时区
function hasNewDraw (timeRules, isQuickDraw, delay, lastDrawTime, tz) {
  if (!timeRules || !lastDrawTime || !tz || timeRules.length === 0) {
    throw new VError(`解析开奖时间出错，彩票配置有误请检查。时区：(${tz})，上次开奖：(${lastDrawTime})，开奖规则：(${timeRules})。`)
  }
  for (const timeRule of timeRules) {
    if (!delay) {
      delay = 0
    }
    let currentDate = parseDrawTime(lastDrawTime, tz)
    if (!isQuickDraw) {
      currentDate = currentDate.add(1, 'day')
    }
    const endDate = moment().tz(tz).add(-delay, 'm')
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

module.exports = {
  sleep,
  hasNewDraw
}
