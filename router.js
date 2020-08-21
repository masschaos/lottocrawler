const VError = require('verror')

function route (country, id) {
  try {
    // 适配国家代码是 us-ca 这种国家的州的情况
    if (country.includes('_')) {
      country = country.split('_').join('/')
    }
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
