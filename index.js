const im = require('./util/im')
const route = require('./router')
const { rightNow, haveCrawledToday } = require('./util')
const { fetchLotteries, fetchLastestResult, fetchSystemConfig } = require('./inner/api')

// 每个 cron 周期，从这里开始执行
async function run () {
  try {
    // 取得部署区域系统配置
    const resp = await fetchSystemConfig()
    console.log(resp)
    // 遍历该区域所有需要爬的国家
    for (const country of resp.countries.filter(x => { return x.upstream && x.upstream === 'crawler' })) {
      // 一个国家有多个level
      for (const level of country.levels) {
        // 彩种列表
        const lotteries = await fetchLotteries(country.code, level.code)
        if (lotteries.length === 0) {
          im.error('预期外情况，国家彩票列表为空', { country: country.name, level: level.code })
          break
        }
        // 最新结果列表
        const results = await fetchLastestResult(country.code, level.code)
        if (results.length === 0) {
          im.error('预期外情况，国家最新结果为空', { country: country.name, level: level.code })
          break
        }
        // 开始检查每个彩票
        for (const lottery of lotteries) {
          // 根据预计开奖时间规则(lottery.drawConfig.timeRule)判断是否到了抓取数据的时间 ,
          if (rightNow(lottery.country, lottery.drawConfig.timeRule, lottery.timeZone)) {
            const result = results.find(a => {
              return a.lotteryID === lottery.id
            })
            // 如果未查询到该彩种的开奖信息或者根据该彩种最新开奖信息中的开奖时间(result.drawTime)判断今天是否已经抓取过
            if (result === undefined || !haveCrawledToday(lottery.country, result.drawTime, lottery.timeZone)) {
              const crawlers = route(lottery.country, lottery.id)
              if (!crawlers || crawlers.length === 0) {
                im.error('预期外情况，未找到彩票爬虫', { country: country.name, lottery: lottery.id })
                break
              }
              // 一个彩票会有多个爬虫，调用到成功为止
              for (const Crawler of crawlers) {
                await new Crawler().crawl()
                // TODO: 在这里导入
                // 如果导入成功，则不再使用备用源抓取数据
                break
              }
            }
          }
        }
      }
    }
  } catch (err) {
    im.error(err.message + '\n```' + err.stack + '```')
  }
}

module.exports = run
