const crawler = require("./crawler")
const moment = require('moment')
const moneyFormat = require('../../../util/format').moneyFormat

class setForLifeCrawler extends crawler {
    constructor() {
        super("au-super-66")
    }

    /* 
    [
        {
        "drawTime":"20110426000000",
        "detail": [{"name": "1", "prize": "$70,686.30", "count": 0},
        {"name": "2", "prize": "$6,666.00", "count": 0},
        {"name": "3", "prize": "$666.00", "count": 9},
        {"name": "4", "prize": "$666.00", "count": 9},
        {"name": "5", "prize": "$666.00", "count": 9}
        ],
        "jackpot": [ ],
        "other": [ ],
        "issue": "1789",
        "numbers": "3|8|6|2|5|9",
        "name": "Super 66",
        "lotteryID": "au-super-66"
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
            "numbers": [data.PrimaryNumbers.join('|'), data.SecondaryNumbers.join('|')].join('|'),
            "name": "Super 66",
            "lotteryID": "au-super-66"
        }
        return item
    }
}

module.exports = setForLifeCrawler