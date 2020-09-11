const config = {
  baseURL: process.env.BASE_URL || 'https://seaapi.lottowawa.com/staging',
  token: process.env.TOKEN,
  cron: process.env.CRON || '0 5 * * * *',
  restTime: process.env.REST_TIME || 300,
  parallel: parseInt(process.env.PARALLEL) || 2,
  env: process.env.DEPLOYMENT_ENV,
  pptrEnv: process.env.PPTR_ENV,
  pptrTimeout: parseInt(process.env.PPTR_TIMEOUT) * 1000 || 50000,
  level: process.env.LOG_LEVEL || 'info',
  autoDelay: parseBool(process.env.AUTO_DELAY),
  db: {
    host: process.env.DB_HOST || 'mysql',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    name: process.env.DB_NAME || 'lotto'
  }
}

function parseBool (x) {
  return (x === 'True' || x === 'TRUE' || x === 'true' || x === '1')
}

module.exports = config
