const moment = require('moment-timezone')
const cronParser = require("cron-parser")

function sleep(ms){
    return new Promise((resolve, reject) => {
        setTimeout(resolve, ms)
    })
}

const timeZoneConfig = {
    "au" : {
        "GMT+10:00": "Australia/Sydney"
    }
}

function rightNow(country, timeRule, timeZone){
    const cron = cronParser.parseExpression(timeRule, {
        currentDate: moment(moment().format("YYYY-MM-DD 00:00:00"), "YYYY-MM-DD HH:mm:ss").toDate(),
        endDate: new Date(),
        tz: timeZoneConfig[country][timeZone]
    })
    return cron.hasNext()
}

module.exports = {
    sleep,
    rightNow
}