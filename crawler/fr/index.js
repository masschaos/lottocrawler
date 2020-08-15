/**
 * @Author: maple
 * @Date: 2020-08-15 21:09:44
 * @LastEditors: maple
 * @LastEditTime: 2020-08-15 21:11:26
 */
const EuromillionsMyMillion = require('./crawlers/fr-euromillions-my-million')
const Kisekaeqoochan = require('./crawlers/fr-keno-gagnantavie')
const Loto = require('./crawlers/fr-loto')

const crawlers = new Map()
crawlers.set('fr-euromillions-my-million', [EuromillionsMyMillion])
crawlers.set('fr-keno-gagnantavie', [Kisekaeqoochan])
crawlers.set('fr-loto', [Loto])

module.exports = crawlers
