const crawler = require('./crawler')
const moment = require('moment')
const money_format = require('../../../util/format').money_format

class tattsLottoCrawler extends crawler {
    constructor(){
        super('au-tattslotto')
    }

    /*
    [
        {
        "drawTime":"20110426000000",
        "detail": [{"Division": "1", "Division Prize": "", "Winners": 0},
        {"Division": "2", "Division Prize": "$13,184.65", "Winners": 46},
        {"Division": "3", "Division Prize": "$1,252.40", "Winners": 1045},
        {"Division": "4", "Division Prize": "$36.80", "Winners": 1045},
        {"Division": "5", "Division Prize": "$23.7", "Winners": 1045},
        {"Division": "6", "Division Prize": "$12.95", "Winners": 1045}
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
    parse(data){
        let item = {
            "drawTime": moment(data.DrawDate).format('YYYYMMDDHHmmss'),
            "detail": data.Dividends.map(a => {
                let result = {
                    "Division": a.Division, 
                    "Division Prize": a.BlocDividend > 0 ? money_format(a.BlocDividend, 2, ".", ",","$") : "" , 
                    "Winners": a.BlocNumberOfWinners
                }
                return result
            }),
            "jackpot": [ ],
            "other": [ ],
            "issue": data.DrawNumber,
            "numbers": [data.PrimaryNumbers.join(','), data.SecondaryNumbers.join(',')].join('#'),
            "name": "TattsLotto",
            "lotteryID": "au-tattslotto"
        }
        return item
    }
}

module.exports = tattsLottoCrawler