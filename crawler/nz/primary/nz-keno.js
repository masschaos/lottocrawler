const crawler = require('./crawler')
const moment = require('moment')
const moneyFormat = require('../../../util/format').moneyFormat

class KenoCrawler extends crawler {
  constructor () {
    super('keno')
  }

  /*
    {
  "lotteryID": "za-keno",
  "name": "Keno",
  "issue": "18767",
  "drawTime": "20200722180000",
  "numbers": "43,35,46,45,14,64,02,23,27,49,13,61,31,21,79,29,80,74,28,36",
  "other": [
    {
      "multiplier": "1.5"
    }
  ]
}

    */
  parse (data) {
    const item = {
      drawTime: moment(data.drawDate + " " + data.drawTime).format('YYYYMMDDHHmmss'),
      other: [{multiplier: data.multiplier}],
      issue: data.drawNumber,
      numbers: data.winningNumbersDrawOrder.join(','),
      name: 'Keno',
      lotteryID: 'nz-keno'
    }
    return item
  }
}

module.exports = new KenoCrawler()
