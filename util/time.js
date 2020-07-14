const moment = require('moment-timezone')
const cronParser = require('cron-parser')
const VError = require('verror')

function sleep (ms) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms)
  })
}

// convert 20201231000000 format to Date
function parseDrawTime (drawTime, tz) {
  return moment(drawTime, 'YYYYMMDDhhmmss', tz)
}

// timeRule 开奖规则 cron
// delay 结果延迟 分钟
// lastDrawTime 上次开奖时间
// tz 时区
function hasNewDraw (timeRule, delay, lastDrawTime, tz) {
  if (!timeRule || !lastDrawTime || !tz) {
    throw new VError(`解析开奖时间出错，彩票配置有误请检查。时区：(${tz})，上次开奖：(${lastDrawTime})，开奖规则：(${timeRule})。`)
  }
  if (!delay) {
    delay = 0
  }
  const cron = cronParser.parseExpression(timeRule, {
    currentDate: parseDrawTime(lastDrawTime, tz),
    endDate: moment().tz(tz).add(-delay, 'm'),
    tz
  })
  return cron.hasNext()
}

module.exports = {
  sleep,
  hasNewDraw
}
