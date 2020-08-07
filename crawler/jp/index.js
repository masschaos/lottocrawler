/**
 * @Author: maple
 * @Date: 2020-08-05 20:58:46
 * @LastEditors: maple
 * @LastEditTime: 2020-08-07 13:32:24
 */

const Bingo5 = require('./crawlers/jp-bingo5')
const Kisekaeqoochan = require('./crawlers/jp-kisekaeqoochan')
const Loto6 = require('./crawlers/jp-loto6')
const Loto7 = require('./crawlers/jp-loto7')
const Numbers3 = require('./crawlers/jp-numbers3')
const Numbers4 = require('./crawlers/jp-numbers4')
const Miniloto = require('./crawlers/jp-miniloto')

const crawlers = new Map()
crawlers.set('jp-bingo5', [Bingo5])
crawlers.set('jp-kisekaeqoochan', [Kisekaeqoochan])
crawlers.set('jp-loto6', [Loto6])
crawlers.set('jp-loto7', [Loto7])
crawlers.set('jp-numbers3', [Numbers3])
crawlers.set('jp-numbers4', [Numbers4])
crawlers.set('jp-miniloto', [Miniloto])

module.exports = crawlers
