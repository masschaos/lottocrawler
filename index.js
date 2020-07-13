const getJob = require('./job').getJob
const CronJob = require('cron').CronJob
const { innerApi } = require('util/api')

// 每个 cron 周期，从这里开始执行
async function run () {
  try {
    const resp = await innerApi.fetchSystemConfig()
    for (const country of resp.data.countries) {
      const CountryJob = getJob(country.code)
      if (CountryJob) {
        new CountryJob().start()
      }
    }
  } catch (err) {
    console.log(err)
  }
}

// 每个小时的 5分开始一轮检查
var job = new CronJob('0 5 * * * *', run)
job.start()
