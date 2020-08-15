/**
 * @Author: maple
 * @Date: 2020-08-16 04:25:12
 * @LastEditors: maple
 * @LastEditTime: 2020-08-16 05:40:27
 */
const Game720 = require('./crawlers/kr-game720')
const Letou645 = require('./crawlers/kr-letou-645')

const crawlers = new Map()
crawlers.set('kr-game720', [Game720])
crawlers.set('kr-letou-645', [Letou645])

module.exports = crawlers
