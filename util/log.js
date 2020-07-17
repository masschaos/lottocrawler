const pino = require('pino')
const { level } = require('../config')

const log = pino({
  level,
  // 在启用日志收集系统之前，格式化日志以便查看
  prettyPrint: {
    translateTime: true
  }
})

module.exports = log
