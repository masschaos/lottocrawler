// const getJob = require('./job').getJob
const { innerApi } = require('./inner/api')

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
    console.log('message:', err.message)
    console.log('name:', err.name)
    console.log('stack:', err.stack)
  }
}

module.exports = run
