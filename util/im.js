const IM = require('@masschaos/im')
const { env } = require('../config')
const log = require('./log')

const im = new IM({
  source: '彩票结果爬虫',
  env,
  logger: log
})

module.exports = im
