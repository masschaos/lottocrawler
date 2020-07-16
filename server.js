const CronJob = require('cron').CronJob
const run = require('./index')
const { cron } = require('./config')
const im = require('./util/im')

// 根据环境变量指定的 cron 循环爬取
var job = new CronJob(cron, run)
im.info('服务端重新启动')
job.start()
