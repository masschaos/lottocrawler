const EuroJackpot = require('./primary/de-euro-jackpot')
const GlucksSpirale = require('./primary/de-glucks-spirale')
const Keno = require('./primary/de-keno')
const Lotto6aus49 = require('./primary/de-lotto-6aus49')
const Plus5 = require('./primary/de-plus5')
const Spiel77 = require('./primary/de-spiel77')
const Super6 = require('./primary/de-super6')

const crawlers = new Map()
crawlers.set('de-euro-jackpot', [EuroJackpot])
crawlers.set('de-glucks-spirale', [GlucksSpirale])
crawlers.set('de-keno', [Keno])
crawlers.set('de-lotto-6aus49', [Lotto6aus49])
crawlers.set('de-plus5', [Plus5])
crawlers.set('de-spiel77', [Spiel77])
crawlers.set('de-super6', [Super6])

module.exports = crawlers
