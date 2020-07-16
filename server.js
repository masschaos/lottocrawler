const CronJob = require('cron').CronJob
const run = require('./index')
const { cron } = require('./config')

// 每个小时的 5分开始一轮检查
var job = new CronJob(cron, run)
job.start()
