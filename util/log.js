const pino = require('pino')
const { level } = require('../config')

const log = pino({ level })

module.exports = log
