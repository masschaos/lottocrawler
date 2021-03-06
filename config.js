const config = {
  baseURL: process.env.BASE_URL || 'https://seaapi.lottowawa.com/staging',
  token: process.env.TOKEN,
  cron: process.env.CRON || '0 5 * * * *',
  restTime: process.env.REST_TIME || 300,
  parallel: parseInt(process.env.PARALLEL) || 2,
  env: process.env.DEPLOYMENT_ENV,
  pptrEnv: process.env.PPTR_ENV,
  pptrTimeout: parseInt(process.env.PPTR_TIMEOUT) * 1000 || 50000,
  level: process.env.LOG_LEVEL || 'info'
}

module.exports = config
