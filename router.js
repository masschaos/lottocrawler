const VError = require('verror')

function route (country, id) {
  try {
    const crawlerMap = require('./crawler/' + country)
    const crawlers = crawlerMap.get(id)
    if (crawlers) {
      return crawlers
    }
  } catch (err) {
    throw new VError(err, `寻找国家(${country})文件夹失败`)
  }
  throw new VError(`寻找爬虫(${id})失败`)
}

module.exports = route
