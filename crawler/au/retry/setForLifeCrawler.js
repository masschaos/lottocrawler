const crawler = require("./crawler")
const moment = require('moment')
const money_format = require('../../../util/format').money_format

class setForLifeCrawler extends crawler {
    constructor(){
        super("au-set-for-life")
    }

    /* 
    [
        {
        "drawTime":"20110426000000",
        "detail": [{"Division": "1", "Division Prize": "", "Winners": 0},
        {"Division": "2", "Division Prize": "", "Winners": 0},
        {"Division": "3", "Division Prize": "$925.65", "Winners": 9}
        ],
        "jackpot": [ ],
        "other": [ ],
        "issue": "1789",
        "numbers": "23,40,27,21,39,29,28#4,36",
        "name": "Set for Life",
        "lotteryID": "au-set-for-life"
        }
    ]
    */
    parse(data){
        let item = {
            "drawTime": moment(data.DrawDate).format('YYYYMMDDHHmmss'),
            "detail": data.Dividends.length <=0 ? [] : data.Dividends.map(a => {
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
            "name": "Set for Life",
            "lotteryID": "au-set-for-life"
        }
        return item
    }
}

module.exports = setForLifeCrawler