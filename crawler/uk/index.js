
const Lotto = require('./latest/uk-lotto')
const EuroMillions = require('./latest/uk-euromillions')
const EuroMillionsHotPicks = require('./latest/uk-euromillions-hotpicks')
const Thunderball = require('./latest/uk-thunderball')
const SetForLife = require('./latest/uk-set-for-life')
const LottoHotPicks = require('./latest/uk-lotto-hotpicks')
const IrishLotto = require('./latest/uk-irish-lotto')
// const PostcodeLottery = require('./uk-postcode-lottery')
const HealthLottery = require('./latest/uk-health-lottery')
const LocalLottery = require('./latest/uk-local-lottery')
const FreeLottery = require('./latest/uk-free-lottery')
const FreeMonthLottery = require('./latest/uk-free-month-lottery')

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

module.exports = crawlers
