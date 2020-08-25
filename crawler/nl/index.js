/**
 * @Author: maple
 * @Date: 2020-08-24 21:11:45
 * @LastEditors: maple
 * @LastEditTime: 2020-08-24 22:40:08
 */
const lotto = require('./crawlers/nl-lotto')
// const Kisekaeqoochan = require('./crawlers/fr-keno-gagnantavie')
// const Loto = require('./crawlers/fr-loto')

const crawlers = new Map()
crawlers.set('nl-lotto', [lotto])
// crawlers.set('fr-keno-gagnantavie', [Kisekaeqoochan])
// crawlers.set('fr-loto', [Loto])

module.exports = crawlers
