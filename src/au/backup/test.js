const crawl = require('./index')

const lottos = [
  'au-mon-wed-lotto',
  'au-powerball',
  'au-set-for-life',
  'au-oz-lotto',
  'au-super-66'
]

lottos.map(lottoID => {
  crawl(lottoID).then((res) => {
    console.log(JSON.stringify(res))
  })
})
