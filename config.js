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

const auCrawlerApiBaseUrl = 'https://data.api.thelott.com/sales/vmax/web/data/lotto'

const config = {
  baseURL: process.env.BASE_URL || 'https://seaapi.lottowawa.com/staging',
  token: process.env.TOKEN,
  im: {
    provider: process.env.IM_PROVIDER || 'slack',
    token: process.env.IM_TOKEN,
    debugChannel: process.env.IM_DEBUG_CHANNEL,
    infoChannel: process.env.IM_INFO_CHANNEL,
    errorChannel: process.env.IM_ERROR_CHANNEL
  }
}

module.exports = {
  lotteryIdProductCodeConfig,
  lotteryIdConfig,
  auCrawlerApiBaseUrl,
  config
}
