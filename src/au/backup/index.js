const crawlers = require('./crawler/index')

function crawl (lottoID) {
  const crawler = crawlers.get(lottoID)
  return crawler().then(res => {
    if (res === null) {
      console.log('爬取失败: ', lottoID)
      return null
    }
    // 调用接口保存结果, 代码复用 TODO
    console.log('爬取成功: ', lottoID)
    return res
  })
}

module.exports = crawl
