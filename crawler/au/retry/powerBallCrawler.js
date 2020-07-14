const crawler = require("./crawler")
const moment = require('moment')
const money_format = require('../../../util/format').money_format

class powerBallCrawler extends crawler {
    constructor() {
        super("au-powerball")
    }

    /* 
     [
         {
         "drawTime":"20110426000000",
         "detail": [{"name": "1", "prize": "",  "count": 0},
         {"name": "2", "prize": "", "count": 0},
         {"name": "3", "prize": "$925.65", "count": 9}
         ],
         "jackpot": [ ],
         "other": [ ],
         "issue": "1789",
         "numbers": "23,40,27,21,39,29,28|17",
         "name": "Powerball",
         "lotteryID": "au-powerball"
         }
     ]
     */
    parse(data) {
        let item = {
            "drawTime": moment(data.DrawDate).format('YYYYMMDDHHmmss'),
            "detail": data.Dividends.length <= 0 ? [] : data.Dividends.map(a => {
                let result = {
                    name: a.Division,
                    prize: a.BlocDividend > 0 ? money_format(a.BlocDividend, 2, ".", ",", "$") : "",
                    count: a.BlocNumberOfWinners
                }
                return result
            }),
            "jackpot": [],
            "other": [],
            "issue": data.DrawNumber,
            "numbers": [data.PrimaryNumbers.join(','), data.SecondaryNumbers.join(',')].join('|'),
            "name": "Powerball",
            "lotteryID": "au-powerball"
        }
        return item
    }
}

module.exports = powerBallCrawler