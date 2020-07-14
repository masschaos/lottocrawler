const VError = require('verror')

function route (country, id) {
  try {
    const getCrawler = require('./crawler/' + country + '/latest')
    return getCrawler(id)
  } catch (err) {
    throw new VError(err, `寻找国家(${country})爬虫失败`)
  }
}

module.exports = route
