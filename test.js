const moment = require("moment-timezone")

// console.log(new moment().tz("GMT+10:00").format("YYYY-MM-DD HH:mm:ss"))

// 获取当前时区
// console.log(moment.tz.guess())

// const weekOfday = moment().format('E')
// console.log(weekOfday)
// console.log(moment().add(7-weekOfday, 'days'))
// console.log(moment().add(7-weekOfday, 'days').format('YYYY-MM-DD')+" 19:30")
// console.log(moment(moment().add(7-weekOfday, 'days').format('YYYY-MM-DD')+" 19:30"))
// console.log(moment(moment(moment().add(7-weekOfday, 'days').format('YYYY-MM-DD')+" 19:30")).diff(moment(new moment()), 'seconds'))
// console.log(moment("2014-06-01 12:00").tz("America/New_York"))

// const compareLocalTime = require('./util').compareLocalTime

// console.log(compareLocalTime('au', '00 21 * * 6', 'GMT+10:00'))

// const {innerApi} = require("./util/api")

// new innerApi().fetchLotteries("au", 0).then(res => {
//     console.log(res)
// })


// const cronParser = require("cron-parser")

// var cron = cronParser.parseExpression("* 21 01 * * 4", {
//     currentDate: moment(moment().format("YYYY-MM-DD 00:00:00"), "YYYY-MM-DD HH:mm:ss").toDate(),
//     endDate: new Date(),
//     tz: "Australia/Sydney"
// })
// console.log(cron.hasNext())

// console.log(moment("2020-07-08 19:30:00").clone().tz("Australia/Sydney").format("YYYY-MM-DD HH:mm:ss"))


// console.log(moment().format("YYYY-MM-DD 00:00:00"))
// console.log(moment(moment().format("YYYY-MM-DD 00:00:00"), "YYYY-MM-DD HH:mm:ss").toDate())


const timeNowLocal = moment()
console.log(timeNowLocal)
const timeNowAu = moment().tz("Australia/Sydney")
console.log(timeNowAu)
console.log(timeNowLocal.diff(timeNowAu, 'hours'))
const timeDrawTimeLocal = moment("20200712000000", "YYYYMMDDHHmmss")
const timeDrawTimeAu = moment("20200712000000", "YYYYMMDDHHmmss").tz("Australia/Sydney")
console.log(timeDrawTimeLocal)
console.log(timeDrawTimeAu)

