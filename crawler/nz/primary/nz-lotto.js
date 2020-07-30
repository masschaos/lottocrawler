const crawler = require('./crawler')
const moment = require('moment')
const moneyFormat = require('../../../util/format').moneyFormat

class LottoCrawler extends crawler {
  constructor () {
    super('lotto')
  }

  parse (data) {
    const lotto = data.lotto
    const strike = data.strike
    const powerBall = data.powerBall
    const lottoNumber = lotto.lottoWinningNumbers.numbers.join(',')
    const bonusNumber = lotto.lottoWinningNumbers.bonusBalls
    const strikeNumber = strike.strikeWinningNumbers.join(',')
    const powerballNumber = powerBall.powerballWinningNumber
    const numbers = `${lottoNumber}#${bonusNumber}|${powerballNumber}|${strikeNumber}`
    let nextJackpot = ['', '', '']; const jackpot = data.jackpot
    if (Object.keys(jackpot).length > 2) { // jackpot 对象元素少于3个表明出错
      nextJackpot = [
        jackpot.lotto_jackpot > 0 ? moneyFormat(jackpot.lotto_jackpot, 2, '.', ',', '$') : jackpot.lotto_jackpot,
        jackpot.powerball_jackpot > 0 ? moneyFormat(jackpot.powerball_jackpot, 2, '.', ',', '$') : jackpot.powerball_jackpot,
        jackpot.strike_jackpot > 0 ? moneyFormat(jackpot.strike_jackpot, 2, '.', ',', '$') : jackpot.strike_jackpot
      ]
    }

    return {
      drawTime: moment(lotto.drawDate + ' ' + lotto.drawTime).format('YYYYMMDDHHmmss'),
      nextJackpot: nextJackpot,
      poolSize: [lotto.totalLottoPrizes, powerBall.totalPowerballPrizes, strike.totalStrikePrizes],
      breakdown: [
        {
          name: 'Lotto',
          detail: lotto.lottoWinners.map(winner => {
            return {
              name: 'Division ' + winner.division,
              count: winner.numberOfWinners,
              prize: winner.prizeValue > 0 ? moneyFormat(winner.prizeValue, 2, '.', ',', '$') : winner.prizeValue
            }
          })
        },
        {
          name: 'Powerball',
          detail: powerBall.powerballWinners.map(winner => {
            return {
              name: 'Division ' + winner.division,
              count: winner.numberOfWinners,
              prize: winner.combinedPrizeValue > 0 ? moneyFormat(winner.combinedPrizeValue, 2, '.', ',', '$') : winner.prizeValue
            }
          })
        },
        {
          name: 'Strike',
          detail: strike.strikeWinners.map(winner => {
            return {
              name: 'Division ' + winner.division,
              count: winner.numberOfWinners,
              prize: winner.prizeValue > 0 ? moneyFormat(winner.prizeValue, 2, '.', ',', '$') : winner.prizeValue
            }
          })
        }
      ],
      other: [
        {
          name: 'Total Lotto winners',
          value: lotto.lottoTotalWinners > 0 ? moneyFormat(lotto.lottoTotalWinners, 0, '', ',', '') : lotto.lottoTotalWinners
        },
        {
          name: 'Total Lotto prize pool',
          value: lotto.lottoPrizePool > 0 ? moneyFormat(lotto.lottoPrizePool, 2, '.', ',', '$') : lotto.lottoPrizePool
        },
        {
          name: 'Total Powerball winners',
          value: powerBall.powerballTotalWinners > 0 ? moneyFormat(powerBall.powerballTotalWinners, 0, '', ',', '') : powerBall.powerballTotalWinners
        },
        {
          name: 'Total Powerball prize pool',
          value: powerBall.powerballPrizePool > 0 ? moneyFormat(powerBall.powerballPrizePool, 2, '.', ',', '$') : powerBall.powerballPrizePool
        },
        {
          name: 'Total Strike winners',
          value: strike.strikeTotalWinners > 0 ? moneyFormat(strike.strikeTotalWinners, 0, '', ',', '') : strike.strikeTotalWinners
        },
        {
          name: 'Total Strike prize pool',
          value: strike.strikePrizePool > 0 ? moneyFormat(strike.strikePrizePool, 2, '.', ',', '$') : strike.strikePrizePool
        }
      ],
      issue: lotto.drawNumber,
      numbers: numbers,
      name: 'Lotto, Powerball and Strike',
      lotteryID: 'nz-lotto'
    }
  }
}

module.exports = new LottoCrawler()
