const crawler = require("./crawler")
const moment = require('moment')
const moneyFormat = require('../../../util/format').moneyFormat

class monWedLottoCrawler extends crawler {
    constructor() {
        super("au-mon-wed-lotto")
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
        "numbers": "23,40,27,21,39,29,28#37,17",
        "name": "Mon & Wed Lotto",
        "lotteryID": "au-mon-wed-lotto"
        }
    ]
    */
    parse(data) {
        let item = {
            "drawTime": moment(data.DrawDate).format('YYYYMMDDHHmmss'),
            "detail": data.Dividends.length <= 0 ? [] : data.Dividends.map(a => {
                let result = {
                    name: a.Division,
                    prize: a.BlocDividend > 0 ? moneyFormat(a.BlocDividend, 2, ".", ",", "$") : "",
                    count: a.BlocNumberOfWinners
                }
                return result
            }),
            "jackpot": [],
            "other": [],
            "issue": data.DrawNumber,
            "numbers": [data.PrimaryNumbers.join(','), data.SecondaryNumbers.join(',')].join('#'),
            "name": "Mon & Wed Lotto",
            "lotteryID": "au-mon-wed-lotto"
        }
        return item
    }
}

module.exports = monWedLottoCrawler