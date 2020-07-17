
const Lotto = require('./uk-lotto')
const EuroMillions = require('./uk-euromillions')
const EuroMillionsHotPicks = require('./uk-euromillions-hotpicks')
const Thunderball = require('./uk-thunderball')
const SetForLife = require('./uk-set-for-life')
const LottoHotPicks = require('./uk-lotto-hotpicks')
const IrishLotto = require('./uk-irish-lotto')
// const PostcodeLottery = require('./uk-postcode-lottery')
const HealthLottery = require('./uk-health-lottery')
const LocalLottery = require('./uk-local-lottery')
const FreeLottery = require('./uk-free-lottery')
const FreeMonthLottery = require('./uk-free-month-lottery')

const crawlers = new Map()

crawlers.set('uk-lotto', [Lotto])
crawlers.set('uk-euromillions', [EuroMillions])
crawlers.set('uk-euromillions-hotpicks', [EuroMillionsHotPicks])
crawlers.set('uk-thunderball', [Thunderball])
crawlers.set('uk-set-for-life', [SetForLife])
crawlers.set('uk-lotto-hotpicks', [LottoHotPicks])
crawlers.set('uk-irish-lotto', [IrishLotto])
// crawlers.set('uk-postcode-lottery', PostcodeLottery)
crawlers.set('uk-health-lottery', [HealthLottery])
crawlers.set('uk-local-lottery', [LocalLottery])
crawlers.set('uk-free-lottery', [FreeLottery])
crawlers.set('uk-free-month-lottery', [FreeMonthLottery])

function getCrawler (lotteryId) {
  if (crawlers.has(lotteryId)) {
    return crawlers.get(lotteryId)
  }
  return null
}

module.exports = getCrawler
