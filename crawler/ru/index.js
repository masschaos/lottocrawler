const crawlers = new Map()
crawlers.set('ru-6-out-of-36', [require('./latest/ru-6-out-of-36')])
crawlers.set('ru-bingo-75', [require('./latest/ru-bingo-75')])
crawlers.set('ru-golden-luck', [require('./latest/ru-golden-luck')])
crawlers.set('ru-gosloto-4-out-of-20', [require('./latest/ru-gosloto-4-out-of-20')])
crawlers.set('ru-gosloto-6-out-of-45', [require('./latest/ru-gosloto-6-out-of-45')])
crawlers.set('ru-gosloto-7-out-of-49', [require('./latest/ru-gosloto-7-out-of-49')])
crawlers.set('ru-housing-lottery', [require('./latest/ru-housing-lottery')])
crawlers.set('ru-russian-lotto', [require('./latest/ru-russian-lotto')])
crawlers.set('ru-russian-lotto2', [require('./latest/ru-russian-lotto2')])
crawlers.set('ru-sportloto-matchball', [require('./latest/ru-sportloto-matchball')])
crawlers.set('ru-zodiac', [require('./latest/ru-zodiac')])

module.exports = crawlers