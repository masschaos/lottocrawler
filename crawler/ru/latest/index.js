const crawlers = new Map()
crawlers.set('ru-6-out-of-36', [require('./ru-6-out-of-36')])
crawlers.set('ru-bingo-75', [require('./ru-bingo-75')])
crawlers.set('ru-golden-luck', [require('./ru-golden-luck')])
crawlers.set('ru-gosloto-4-out-of-20', [require('./ru-gosloto-4-out-of-20')])
crawlers.set('ru-gosloto-6-out-of-45', [require('./ru-gosloto-6-out-of-45')])
crawlers.set('ru-gosloto-7-out-of-49', [require('./ru-gosloto-7-out-of-49')])
crawlers.set('ru-housing-lottery', [require('./ru-housing-lottery')])
crawlers.set('ru-russian-lotto', [require('./ru-russian-lotto')])
crawlers.set('ru-russian-lotto2', [require('./ru-russian-lotto2')])
crawlers.set('ru-sportloto-matchball', [require('./ru-sportloto-matchball')])
crawlers.set('ru-zodiac', [require('./ru-zodiac')])

function getCrawler (lotteryId) {
  if (crawlers.has(lotteryId)) {
    return crawlers.get(lotteryId)
  }
  return null
}

module.exports = getCrawler
