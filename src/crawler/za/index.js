const DAILY_LOTTO = require('./daily-lotto')
const LOTTO = require('./lotto')

const crawlers = new Map()
crawlers.set('za-daily-lotto', DAILY_LOTTO)
crawlers.set('za-lotto', LOTTO)

module.exports = crawlers
