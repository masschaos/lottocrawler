const VError = require('verror')
const Semaphore = require('async-mutex').Semaphore
const im = require('./util/im')
const log = require('./util/log')
const route = require('./router')
const { parallel } = require('./config')
const { hasNewDraw } = require('./util/time')
const { fetchLotteries, fetchLatestResult, fetchSystemConfig, saveLatestResult } = require('./inner/api')
const { closeBrowser } = require('./pptr')

// global semaphore, limit parallel job count
const semaphore = new Semaphore(parallel)

// 每个 cron 周期，从这里开始执行
// 参数为调试时使用，可以只运行一个国家或者一个彩票
// 不传参则会运行所有的爬虫
async function run (region, lotto) {
  try {
    // 取得部署区域系统配置
    const resp = await fetchSystemConfig()
    log.debug(resp)
    // 遍历该区域所有需要爬的国家
    for (const country of resp.countries.filter(x => { return x.upstream && x.upstream === 'crawler' })) {
      if (region && country.code !== region) {
        log.info(`跳过${country.name}`)
        continue
      }
      // 一个国家有多个level
      for (const level of country.levels) {
        log.info(`check ${country.name} level ${level.code}`)
        // 彩种列表
        const lotteries = await fetchLotteries(country.code, level.code)
        if (lotteries.length === 0) {
          im.error('预期外情况，国家彩票列表为空', { country: country.name, level: level.code })
          break
        }
        // 最新结果列表
        const results = await fetchLatestResult(country.code, level.code)
        if (results.length === 0) {
          im.info('运行爬虫时，国家最新结果为空，这只应在首次出现', { country: country.name, level: level.code })
        }
        // 开始检查每个彩票
        await Promise.all(lotteries.map(async (lottery) => {
          // 如果传参只运行指定的
          if (lotto && lottery.id !== lotto) {
            log.info(`跳过${lottery.id}`)
            return
          }
          // 忽略关闭的彩票
          if (lottery.closed) {
            return
          }
          // 只运行 cron 模式的爬虫
          if (lottery.crawlerMode && lottery.crawlerMode !== 'cron') {
            log.debug(`跳过${lottery.id}`)
            return
          }
          const { drawConfig: { timeRules }, delay, tz, id, isQuickDraw } = lottery
          // 找到对应的结果
          const result = results.find(x => {
            return x.lotteryID === id
          })
          // 根据预计开奖时间规则(lottery.drawConfig.timeRule)判断是否到了抓取数据的时间 ,
          if (result && !hasNewDraw(timeRules, delay, result.drawTime, tz)) {
            log.info(`还未开奖，跳过${id}`)
            return
          }
          const crawlers = route(lottery.country, id)
          if (!crawlers || crawlers.length === 0) {
            im.info('预期外情况，未找到彩票爬虫，请关注。', { country: country.name, lottery: id })
            return
          }
          // 一个彩票会有多个爬虫，调用到成功为止
          let bak = false
          for (const crawler of crawlers) {
            // 信号量限制并行度
            const [, release] = await semaphore.acquire()
            // 捕获单个彩票爬虫的异常，如果出问题了就继续下一个
            try {
              // 启动爬虫
              log.info(`启动爬虫 ${id}`)
              const data = await crawler.crawl()
              log.debug({ data })
              // 和已经存在的对比一下
              if (result && data.drawTime <= result.drawTime) {
                im.info('开奖时间到了但是还没新数据，请改善延迟配置', {
                  彩票: id,
                  规则: timeRules,
                  我们: result.drawTime,
                  网站: data.drawTime,
                  延迟: delay,
                  快开: isQuickDraw
                })
                continue
              }
              // 发生了备用源数据更快的情况
              if (bak) {
                im.info('发生了备用源数据更快的情况', {
                  id: id,
                  source: crawler.baseURL
                })
              }
              bak = true
              // 保存数据 快开只写日志不通知im
              await saveLatestResult(data)
              if (isQuickDraw) {
                log.info({
                  lottery: id,
                  drawTime: data.drawTime
                }, '保存成功')
              } else {
                im.info('彩票爬虫更新数据成功', {
                  彩票: id,
                  期次: data.drawTime
                })
              }
              // 如果导入成功，则不再使用备用源抓取数据
              break
            } catch (err) {
              switch (err.name) {
                case 'SiteClosedError':
                  im.error('网站在停业时间，将检查调度配置。', {
                    彩票: id,
                    规则: timeRules,
                    延迟: delay,
                    快开: isQuickDraw
                  })
                  break
                case 'DrawingError':
                  im.info('网站正在开奖中，请适当修正调度延迟规则。', {
                    彩票: id,
                    规则: timeRules,
                    延迟: delay,
                    快开: isQuickDraw
                  })
                  break
                default:
                  im.error(`${lottery.id}的爬虫出了问题请核查:${err.message}` + '\n```' + VError.fullStack(err) + '```', {
                    彩票: id,
                    国家: country.name
                  })
              }
              // 将继续尝试该彩票下一个爬虫
            } finally {
              // 释放信号量
              release()
            }
          }
        }))
      }
    }
  } catch (err) {
    im.error('爬虫挂了快去修复，发生如下错误：\n' + err.message + '\n```' + VError.fullStack(err) + '```')
  } finally {
    // 无论如何都关闭浏览器实例
    await closeBrowser()
  }
}

module.exports = run
