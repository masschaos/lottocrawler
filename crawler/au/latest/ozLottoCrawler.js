const crawler = require('./crawler')
const moment = require('moment')
const moneyFormat = require('../../../util/format').moneyFormat

class OzLottoCrawler extends crawler {
  constructor () {
    super('au-oz-lotto')
  }

  /*
    [
        {
        "drawTime":"20110426000000",
        "detail": [{"name": "1", "prize": "", "count": 0},
                {"name": "2", "prize": "", "count": 0},
                {"name": "3", "prize": "$925.65", "count": 9}
        ],
        "jackpot": [ ],
        "other": [ ],
        "issue": "1789",
        "numbers": "23,40,27,21,39,29,28#14,41",
        "name": "Oz Lotto",
        "lotteryID": "au-oz-lotto"
        }
    ]
    */
  parse (data) {
    const item = {
      drawTime: moment(data.DrawDate).format('YYYYMMDD') + '193000',
      detail: data.Dividends.map(a => {
        const result = {
          name: a.Division,
          prize: a.BlocDividend > 0 ? moneyFormat(a.BlocDividend, 2, '.', ',', '$') : '',
          count: a.BlocNumberOfWinners
        }
        return result
      }),
      jackpot: [],
      other: [],
      issue: data.DrawNumber,
      numbers: [data.PrimaryNumbers.join(','), data.SecondaryNumbers.join(',')].join('#'),
      name: 'Oz Lotto',
      lotteryID: 'au-oz-lotto'
    }
    return item
  }
}

module.exports = new OzLottoCrawler()
