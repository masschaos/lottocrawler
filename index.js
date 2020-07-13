// const getJob = require('./job').getJob
const { innerApi } = require('./inner/api')
const im = require('./util/im')

// 每个 cron 周期，从这里开始执行
async function run () {
  try {
    const resp = await new innerApi().fetchSystemConfig()
    console.log(resp)
    // for (const country of resp.data.countries) {
    //   const CountryJob = getJob(country.code)
    //   if (CountryJob) {
    //     new CountryJob().start()
    //   }
    // }
  } catch (err) {
    im.error(err.message + '\n```' + err.stack + '```')
  }
}

module.exports = run
