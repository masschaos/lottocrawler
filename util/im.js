const IM = require('@masschaos/im')
const { config: { env } } = require('../config')

const im = new IM({
  source: '彩票结果爬虫',
  env
})

module.exports = im
