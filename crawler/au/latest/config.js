
const baseURL = 'https://data.api.thelott.com/sales/vmax/web/data/lotto'

const lotteryIdConfig = [
  'au-tattslotto',
  'au-oz-lotto',
  'au-powerball',
  'au-set-for-life',
  'au-mon-wed-lotto',
  'au-super-66'
]

const lotteryIdProductCodeConfig =
{
  'au-tattslotto': 'TattsLotto',
  'au-oz-lotto': 'OzLotto',
  'au-powerball': 'Powerball',
  'au-set-for-life': 'SetForLife744',
  'au-mon-wed-lotto': 'MonWedLotto',
  'au-super-66': 'Super66'
}

module.exports = {
  baseURL,
  lotteryIdConfig,
  lotteryIdProductCodeConfig
}
