/**
 * @Author: maple
 * @Date: 2020-08-30 14:43:35
 * @LastEditors: maple
 * @LastEditTime: 2020-08-30 14:52:59
 */
const DiaDeSorte = require('./crawler/br-dia-de-sorte')
const DuplaSena = require('./crawler/br-dupla-sena')
const LoteriaFeral = require('./crawler/br-loteria-federal')
const Lotofacil = require('./crawler/br-lotofacil')
const Lotomania = require('./crawler/br-lotomania')
const MegaSena = require('./crawler/br-mega-sena')
const Quina = require('./crawler/br-quina')
const Timemania = require('./crawler/br-timemania')

const crawlers = new Map()
crawlers.set('br-dia-de-sorte', [DiaDeSorte])
crawlers.set('br-dupla-sena', [DuplaSena])
crawlers.set('br-loteria-federal', [LoteriaFeral])
crawlers.set('br-lotofacil', [Lotofacil])
crawlers.set('br-lotomania', [Lotomania])
crawlers.set('br-mega-sena', [MegaSena])
crawlers.set('br-quina', [Quina])
crawlers.set('br-timemania', [Timemania])

module.exports = crawlers
