
// 本代码通过createFile.js脚本自动生成。
const LOTTO = require('../latest/za-lotto')
const LOTTOPLUS1 = require('../latest/za-lotto-plus-1')
const LOTTOPLUS2 = require('../latest/za-lotto-plus-2')
const PowerBall = require('../latest/za-powerball')
const PowerBallPLUS = require('../latest/za-powerball-plus')
const DAILYLOTTO = require('../latest/za-daily-lotto')
const PICK3 = require('../latest/za-pick-3')

const crawlers = new Map()

crawlers.set('za-lotto', LOTTO)
crawlers.set('za-lotto-plus-1', LOTTOPLUS1)
crawlers.set('za-lotto-plus-2', LOTTOPLUS2)
crawlers.set('za-powerball', PowerBall)
crawlers.set('za-powerball-plus', PowerBallPLUS)
crawlers.set('za-daily-lotto', DAILYLOTTO)
crawlers.set('za-pick-3', PICK3)

module.exports = crawlers
