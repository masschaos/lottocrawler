const im = require('./util/im')
const route = require('./router')
const { hasNewDraw } = require('./util/time')
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
          // 找到对应的结果
          const result = results.find(x => {
            return x.lotteryID === lottery.id
          })
          // 根据预计开奖时间规则(lottery.drawConfig.timeRule)判断是否到了抓取数据的时间 ,
          if (result && !hasNewDraw(lottery.drawConfig.timeRule, lottery.delay, result.drawTime, lottery.tz)) {
            console.log(`还未开奖，跳过${lottery.id}`)
            continue
          }
          const crawlers = route(lottery.country, lottery.id)
          if (!crawlers || crawlers.length === 0) {
            im.error('预期外情况，未找到彩票爬虫', { country: country.name, lottery: lottery.id })
            break
          }
          // 一个彩票会有多个爬虫，调用到成功为止
          let bak = false
          for (const Crawler of crawlers) {
            // 捕获单个彩票爬虫的异常，如果出问题了就继续下一个
            try {
              const crawler = new Crawler()
              const data = await crawler.crawl()
              console.log(data)
              // 和已经存在的对比一下
              if (data.drawTime <= result.drawTime) {
                im.info('开奖时间到了但是还没新数据，请改善延迟配置', {
                  id: lottery.id,
                  rule: lottery.timeRule,
                  last: result.drawTime,
                  delay: lottery.delay
                })
                continue
              }
              // 发生了备用源数据更快的情况
              if (bak) {
                im.info('发生了备用源数据更快的情况', {
                  id: lottery.id,
                  source: crawler.baseURL
                })
              }
              bak = true
              // TODO: 在这里导入
              // 如果导入成功，则不再使用备用源抓取数据
              break
            } catch (err) {
              im.error(`${lottery.id}的爬虫出了问题清核查:${err.message}` + '\n```' + err.stack + '```', {
                id: lottery.id,
                国家: country.name
              })
              continue
            }
          }
        }
      }
    }
  } catch (err) {
    im.error('爬虫挂了快去修复，发生如下错误：\n' + err.message + '\n```' + err.stack + '```')
  }
}

module.exports = run
