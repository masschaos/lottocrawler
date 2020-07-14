const crawler = require("./crawler")
const { supportsDescriptors } = require("define-properties")
const moment = require('moment')
const money_format = require('../../../util/format').money_format

class tattsLottoCrawler extends crawler {
    constructor() {
        super("au-tattslotto")
    }

    /*
    [
        {
        "drawTime":"20110426000000",
        "detail": [{"name": "1", "prize": "", "count": 0},
        {"name": "2", "prize": "$13,184.65", "count": 46},
        {"name": "3", "prize": "$1,252.40", "count": 1045},
        {"name": "4", "prize": "$36.80", "count": 1045},
        {"name": "5", "prize": "$23.7", "count": 1045},
        {"name": "6", "prize": "$12.95", "count": 1045}
        ],
        "jackpot": [ ],
        "other": [ ],
        "issue": "1789",
        "numbers": "23,40,27,21,39,29,28#4,36",
        "name": "TattsLotto",
        "lotteryID": "au-tattslotto"
        }
    ]
    */
    parse(data) {
        let item = {
            "drawTime": moment(data.DrawDate).format('YYYYMMDDHHmmss'),
            "detail": data.Dividends.length <= 0 ? [] : data.Dividends.map(a => {
                let result = {
                    "Division": a.Division,
                    "Division Prize": a.BlocDividend > 0 ? money_format(a.BlocDividend, 2, ".", ",", "$") : "",
                    "Winners": a.BlocNumberOfWinners
                }
                return result
            }),
            "jackpot": [],
            "other": [],
            "issue": data.DrawNumber,
            "numbers": [data.PrimaryNumbers.join(','), data.SecondaryNumbers.join(',')].join('#'),
            "name": "TattsLotto",
            "lotteryID": "au-tattslotto"
        }

        return item
    }
}

module.exports = tattsLottoCrawler