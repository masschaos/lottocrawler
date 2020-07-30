const crawler = require('./crawler')
const moment = require('moment')

class KenoCrawler extends crawler {
  constructor () {
    super('keno')
  }

  parse (data) {
    return {
      drawTime: moment(data.drawDate + ' ' + data.drawTime).format('YYYYMMDDHHmmss'),
      other: [
        { name: 'multiplier', value: data.multiplier }
      ],
      issue: data.drawNumber,
      numbers: data.winningNumbersDrawOrder.join(','),
      name: 'Keno',
      lotteryID: 'nz-keno'
    }
  }
}

module.exports = new KenoCrawler()
