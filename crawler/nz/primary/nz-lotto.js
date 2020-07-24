const crawler = require('./crawler')
const moment = require('moment')
const moneyFormat = require('../../../util/format').moneyFormat

class LottoCrawler extends crawler {
  constructor () {
    super('lotto')
  }
/*
    {
  "lotteryID": "za-lotto",
  "name": "Lotto, Powerball and Strike",
  "issue": "1979",
  "drawTime": "20200722000000",
  "numbers": "04,10,18,20,30,40#25|07|30,40,20,18",
  "nextJackpot": [
    "$1,000,000","$23,000,000","$200,000"
  ],
  "poolSize": [
    "$3,638,405","$20,480,244","$636,964"
  ],
  "breakdown": [""],
  "other": [
    {
      "Total Lotto winners": "337,605",
      "Total Lotto prize pool": "$3,638,405",
      "Total Powerball winners": "28,134",
      "Total Powerball prize pool": "$20,480,244",
      "Total Strike winners": "110,428",
      "Total Strike prize pool": "$636,964"
    }
  ]
}
*/

  parse (data) {
    const lotto = data.lotto, strike = data.strike, power_ball = data.powerBall;
    const lotto_number = lotto.lottoWinningNumbers.numbers.join(',')
    const bonus_number = lotto.lottoWinningNumbers.bonusBalls
    const strike_number = strike.strikeWinningNumbers.join(",")
    const powerball_number = power_ball.powerballWinningNumber
    const numbers = `${lotto_number}#${bonus_number}|${powerball_number}|${strike_number}`
    let next_jackpot = ["", "", ""], jackpot = data.jackpot;
    if(Object.keys(jackpot).length>2){// jackpot 对象元素少于3个表明出错
        next_jackpot = [
          jackpot.lotto_jackpot > 0 ? moneyFormat(jackpot.lotto_jackpot, 2, '.', ',', '$') : jackpot.lotto_jackpot,
          jackpot.powerball_jackpot > 0 ? moneyFormat(jackpot.powerball_jackpot, 2, '.', ',', '$') : jackpot.powerball_jackpot,
          jackpot.strike_jackpot > 0 ? moneyFormat(jackpot.strike_jackpot, 2, '.', ',', '$') : jackpot.strike_jackpot,
        ]
    }

    const item = {
      drawTime: moment(lotto.drawDate + " " + lotto.drawTime).format('YYYYMMDDHHmmss'),
      nextJackpot: next_jackpot,
      poolSize: [lotto.totalLottoPrizes, power_ball.totalPowerballPrizes, strike.totalStrikePrizes, ],
      breakdown: [
        {
          name: 'Lotto',
          detail: lotto.lottoWinners.map(winner => {
            return {
              name: 'Division ' + winner.division,
              count: winner.numberOfWinners,
              prize: winner.prizeValue > 0 ? moneyFormat(winner.prizeValue, 2, '.', ',', '$') : winner.prizeValue,
            }
          }),
        },
        {
          name: 'Powerball',
          detail: power_ball.powerballWinners.map(winner => {
            return {
              name: 'Division ' + winner.division,
              count: winner.numberOfWinners,
              prize: winner.combinedPrizeValue > 0 ? moneyFormat(winner.combinedPrizeValue, 2, '.', ',', '$') : winner.prizeValue,
            }
          }),
        },
        {
          name: 'Strike',
          detail: strike.strikeWinners.map(winner => {
            return {
              name: 'Division ' + winner.division,
              count: winner.numberOfWinners,
              prize: winner.prizeValue > 0 ? moneyFormat(winner.prizeValue, 2, '.', ',', '$') : winner.prizeValue,
            }
          }),
        }
      ],
      other: [
        {
          'Total Lotto winners': lotto.lottoTotalWinners > 0 ? moneyFormat(lotto.lottoTotalWinners, 0, '', ',', '') : lotto.lottoTotalWinners,
          'Total Lotto prize pool': lotto.lottoPrizePool > 0 ? moneyFormat(lotto.lottoPrizePool, 2, '.', ',', '$') : lotto.lottoPrizePool,
          'Total Powerball winners': power_ball.powerballTotalWinners > 0 ? moneyFormat(power_ball.powerballTotalWinners, 0, '', ',', '') : power_ball.powerballTotalWinners,
          'Total Powerball prize pool': power_ball.powerballPrizePool > 0 ? moneyFormat(power_ball.powerballPrizePool, 2, '.', ',', '$') : power_ball.powerballPrizePool,
          'Total Strike winners': strike.strikeTotalWinners > 0 ? moneyFormat(strike.strikeTotalWinners, 0, '', ',', '') : strike.strikeTotalWinners,
          'Total Strike prize pool': strike.strikePrizePool > 0 ? moneyFormat(strike.strikePrizePool, 2, '.', ',', '$') : strike.strikePrizePool
        }
      ],
      issue: lotto.drawNumber,
      numbers: numbers,
      name: '"Lotto, Powerball and Strike"',
      lotteryID: 'nz-lotto'
    }
    return item
  }
}

module.exports = new LottoCrawler()