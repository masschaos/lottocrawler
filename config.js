const config = {
  baseURL: process.env.BASE_URL || 'https://seaapi.lottowawa.com/staging',
  token: process.env.TOKEN,
  env: process.env.DEPLOYMENT_ENV,
  pptrEnv: process.env.PPTR_ENV
}

module.exports = config
