const moment = require('moment')
const number_format = require('../util/format').number_format

function auTattsLottoMapper(data){
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
        "numbers": [data.PrimaryNumbers.join(','), data.SecondaryNumbers.join(',')].join(','),
        "name": "TattsLotto",
        "lotteryID": "au-tattslotto"
    }
    return item
}

module.exports = auTattsLottoMapper