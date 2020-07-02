let auTattsLottoMapper = require('./auTattsLottoMapper')
let auOzLottoMapper = require('./auOzLottoMapper')
let auPowerballMapper = require('./auPowerballMapper')
let auSetForLife744Mapper = require('./auSetForLife744Mapper')
let auMonWedLottoMapper = require('./auMonWedLottoMapper')
let auSuper66Mapper = require('./auSuper66Mapper')

let mappers = new Map()
mappers.set('TattsLotto', auTattsLottoMapper)
mappers.set('OzLotto', auOzLottoMapper)
mappers.set('Powerball', auPowerballMapper)
mappers.set('SetForLife744', auSetForLife744Mapper)
mappers.set('MonWedLotto', auMonWedLottoMapper)
mappers.set('Super66', auSuper66Mapper)

module.exports = mappers