const CronJob = require('cron').CronJob
const run = require('./index')
const { cron } = require('./config')
const im = require('./util/im')

// 每个小时的 5分开始一轮检查
var job = new CronJob(cron, run)
im.info('服务端重新启动')
job.start()
