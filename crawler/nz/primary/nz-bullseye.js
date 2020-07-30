const crawler = require('./crawler')
const moment = require('moment')
const moneyFormat = require('../../../util/format').moneyFormat

class MonWedLottoCrawler extends crawler {
  constructor () {
    super('bullseye')
  }

  parse (data) {
    return {
      drawTime: moment(data.drawDate + ' ' + data.drawTime).format('YYYYMMDDHH0000'),
      poolSize: [data.bullseyePrizePool],
      breakdown: [{
        name: 'default',
        detail: data.bullseyeWinners.map(winner => {
          return {
            name: 'Division ' + winner.division,
            count: winner.numberOfWinners,
            prize: winner.prizeValue > 0 ? moneyFormat(winner.prizeValue, 2, '.', ',', '$') : winner.prizeValue
          }
        })
      }],
      issue: data.drawNumber,
      numbers: data.bullseyeWinningNumbers.numbers,
      name: 'Bullseye',
      lotteryID: 'nz-bullseye'
    }
  }
}

module.exports = new MonWedLottoCrawler()
