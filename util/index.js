const moment = require('moment-timezone')
const cronParser = require('cron-parser')

function sleep (ms) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms)
  })
}

// FIXME: 这里有点蠢，完了直接把文字时区写入配置吧。
const timeZoneConfig = {
  au: {
    'GMT+10:00': 'Australia/Sydney'
  }
}

function rightNow (country, timeRule, timeZone) {
  const cron = cronParser.parseExpression('* ' + timeRule, {
    currentDate: moment(moment().format('YYYY-MM-DD 00:00:00'), 'YYYY-MM-DD HH:mm:ss').toDate(),
    endDate: new Date(),
    tz: timeZoneConfig[country][timeZone]
  })
  return cron.hasNext()
}

function haveCrawledToday (country, drawTime, timeZone) {
  // console.log(drawTime)
  const dateValue = moment().tz(timeZoneConfig[country][timeZone]).format('YYYYMMDD')
  //    console.log(dateValue)
  //    console.log(drawTime.substr(0,8))
  //    console.log(dateValue == drawTime.substr(0,8))
  return dateValue === drawTime.substr(0, 8)
}

module.exports = {
  sleep,
  rightNow,
  haveCrawledToday
}
