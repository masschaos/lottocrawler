var LOTTO = require('./primary/za-lotto')
var LOTTOPLUS1 = require('./primary/za-lotto-plus-1')
var LOTTOPLUS2 = require('./primary/za-lotto-plus-2')
var PowerBall = require('./primary/za-powerball')
var PowerBallPLUS = require('./primary/za-powerball-plus')
var DAILYLOTTO = require('./primary/za-daily-lotto')
var PICK3 = require('./primary/za-pick-3')

// crawlers的value值是每个彩种的爬虫列表, 从前到后顺序执行，直到成功
var crawlers = new Map()
crawlers.set('za-lotto', [LOTTO])
crawlers.set('za-lotto-plus-1', [LOTTOPLUS1])
crawlers.set('za-lotto-plus-2', [LOTTOPLUS2])
crawlers.set('za-powerball', [PowerBall])
crawlers.set('za-powerball-plus', [PowerBallPLUS])
crawlers.set('za-daily-lotto', [DAILYLOTTO])
crawlers.set('za-pick-3', [PICK3])

module.exports = crawlers
