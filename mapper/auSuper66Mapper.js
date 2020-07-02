const moment = require('moment')
const number_format = require('../util/format').number_format

/* 
[
    {
    "drawTime":"20110426000000",
    "detail": [{"Division": "1", "Division Prize": "$70,686.30", "Winners": 0},
    {"Division": "2", "Division Prize": "$6,666.00", "Winners": 0},
    {"Division": "3", "Division Prize": "$666.00", "Winners": 9},
    {"Division": "4", "Division Prize": "$666.00", "Winners": 9},
    {"Division": "5", "Division Prize": "$666.00", "Winners": 9}
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
function auSuper66Mapper(data){
    let item = {
        "drawTime": moment(data.DrawDate).format('YYYYMMDDHHmmss'),
        "detail": data.Dividends.map(a => {
            let result = {
                "Division": a.Division, 
                "Division Prize": a.BlocDividend > 0 ? number_format(a.BlocDividend, 2, ".", ",","$") : "" , 
                "Winners": a.BlocNumberOfWinners
            }
            return result
        }),
        "jackpot": [ ],
        "other": [ ],
        "issue": data.DrawNumber,
        "numbers": [data.PrimaryNumbers.join('|'), data.SecondaryNumbers.join('|')].join('|'),
        "name": "Super 66",
        "lotteryID": "au-super-66"
    }
    return item
}

module.exports = auSuper66Mapper