const CronJob = require('cron').CronJob
const run = require('./index')

// 每个小时的 5分开始一轮检查
var job = new CronJob('0 5 * * * *', run)
job.start()
