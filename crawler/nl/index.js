/**
 * @Author: maple
 * @Date: 2020-08-24 21:11:45
 * @LastEditors: maple
 * @LastEditTime: 2020-08-27 03:26:19
 */
const lotto = require('./crawlers/nl-lotto')
const EuroJackpot = require('./crawlers/nl-eurojackpot')
const LuckyDay = require('./crawlers/nl-lucky-day')
const Miljoenenspel = require('./crawlers/nl-miljoenenspel')

const crawlers = new Map()
crawlers.set('nl-lotto', [lotto])
crawlers.set('nl-eurojackpot', [EuroJackpot])
crawlers.set('nl-lucky-day', [LuckyDay])
crawlers.set('nl-miljoenenspel', [Miljoenenspel])

module.exports = crawlers
