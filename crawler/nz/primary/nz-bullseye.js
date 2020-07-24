const crawler = require('./crawler')
const moment = require('moment')
const moneyFormat = require('../../../util/format').moneyFormat

class MonWedLottoCrawler extends crawler {
  constructor () {
    super('bullseye')
  }

  /*
    {
    "lotteryID": "za-bullseye",
    "name": "Bullseye",
    "issue": "3919",
    "drawTime": "20200722000000",
    "numbers": "021588",
    "poolSize": [
      "$112,610"
    ],
    "breakdown":[]
  }
    */
  parse (data) {
    const item = {
      drawTime: moment(data.drawDate + " " + data.drawTime).format('YYYYMMDDHHmmss'),
      poolSize: [data.bullseyePrizePool],
      breakdown: [{
        name: "default",
        detail: data.bullseyeWinners.map(winner => {
          return {
            name: 'Division ' + winner.division ,
            count: winner.numberOfWinners,
            prize: winner.prizeValue > 0 ? moneyFormat(winner.prizeValue, 2, ".", ",", "$") : winner.prizeValue,
          }
        }),
      }],
      issue: data.drawNumber,
      numbers: data.bullseyeWinningNumbers.numbers,
      name: 'Bullseye',
      lotteryID: 'nz-bullseye'
    }
    return item
  }
}

module.exports = new MonWedLottoCrawler()
