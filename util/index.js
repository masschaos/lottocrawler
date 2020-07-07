const moment = require('moment-timezone')

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

function compareLocalTime(country, timeRule, timeZone){
    const rules = timeRule.split(' ')
    const min = rules[0]
    const hour = rules[1]
    const tDayOfWeek = rules[4]
    const cDayOfWeek = moment().format('E')

    const dt1Format = moment().add(tDayOfWeek-cDayOfWeek, 'days').format('YYYY-MM-DD')+` ${hour}:${min}`
    // console.log(timeZoneConfig[country][timeZone])
    // console.log(moment(dt1Format).tz(timeZoneConfig[country][timeZone]))
    const dt1 = moment(dt1Format).tz(timeZoneConfig[country][timeZone])
    const localTimeZone = moment.tz.guess()
    const dt2 = moment()
    // console.log(dt1)
    // console.log(dt2)

    return moment(dt1).diff(dt2, 'seconds')
}

module.exports = {
    sleep,
    compareLocalTime
}