let auTattsLottoMapper = require('./auTattsLottoMapper')
let auOzLottoMapper = require('./auOzLottoMapper')
let auPowerballMapper = require('./auPowerballMapper')
let auSetForLife744Mapper = require('./auSetForLife744Mapper')
let auMonWedLottoMapper = require('./auMonWedLottoMapper')
let auSuper66Mapper = require('./auSuper66Mapper')

let mappers = new Map()
mappers.set('au-tattslotto', auTattsLottoMapper)
mappers.set('au-oz-lotto', auOzLottoMapper)
mappers.set('au-powerball', auPowerballMapper)
mappers.set('au-set-for-life', auSetForLife744Mapper)
mappers.set('au-mon-wed-lotto', auMonWedLottoMapper)
mappers.set('au-super-66', auSuper66Mapper)

function getMapper(lotteryId){
    if(mappers.has(lotteryId)){
        return mappers.get(lotteryId)
    }
    return null
}

module.exports = {getMapper}