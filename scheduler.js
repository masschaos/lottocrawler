const VError = require('verror')
const moment = require('moment')
const Semaphore = require('async-mutex').Semaphore
const im = require('./util/im')
const log = require('./util/log')
const route = require('./router')
const { parallel } = require('./config')
const { hasNewDraw } = require('./util/time')
const { fetchLotteries, fetchLatestResult, fetchSystemConfig, saveLatestResult, saveStepData } = require('./inner/api')
const { closeBrowser } = require('./pptr')

// global semaphore, limit parallel job count
const semaphore = new Semaphore(parallel)

// 无脑循环模式爬虫执行记录, key 为 id ，值为上次执行时间
const loopLog = new Map()

// 循环等待中 需要等待返回true
// 这里不管爬虫是否成功，都会重置循环，防止爬虫出错时过多访问目标
function waitForLoop (id, loopCycle) {
  const now = moment()
  if (!loopLog.has(id)) {
    // 首次执行，没有记录
    log.info(`首次执行不进行循环判断：${id}`)
    loopLog.set(id, now)
    return false
  }
  if (loopLog.get(id).add(loopCycle, 's') < now) {
    // 到时间了，无需等待
    loopLog.set(id, now)
    return false
  } else {
    return true
  }
}

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
          // 找到对应的结果
          const result = results.find(x => {
            return x.lotteryID === lottery.id
          })
          // 爬取改彩种
          await runLottery(lottery, result)
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

// 运行一个彩种的爬虫，传入彩种定义和目前我们的最新结果
async function runLottery (lottery, result) {
  // 将需要的彩种属性取出到变量
  const { drawConfig: { timeRules }, delay, country, tz, id, isQuickDraw, crawlerSteps, crawlerMode, loopCycle } = lottery
  // 根据预设的爬虫模式决定此轮是否需要执行此爬虫
  switch (crawlerMode) {
    // loop 模式 在需要等待时返回
    case 'loop':
      if (waitForLoop(id, loopCycle)) {
        log.debug(`未到循环时间，跳过${id}`)
        return
      }
      break
    // cron 模式 和不存在这个配置，都是默认用cron检查是否要抓取
    default:
      // 根据预计开奖时间规则(lottery.drawConfig.timeRule)判断是否到了抓取数据的时间 ,
      if (result && !hasNewDraw(timeRules, delay, result.drawTime, tz)) {
        log.debug(`还未开奖，跳过${id}`)
        return
      }
  }
  // 检查完毕开始执行，先获取爬虫
  const crawlers = route(country, id)
  if (!crawlers || crawlers.length === 0) {
    im.error('预期外情况，未找到彩票爬虫，请关注。', { country, lottery: id })
    return
  }
  // 一个彩票会有多个爬虫，调用到成功为止
  for (const [i, crawler] of crawlers.entries()) {
    // 发生了备用源被启用的情况
    if (i > 0) {
      im.error('发生了备用源数据被启用的情况，请检查', {
        id: id,
        source: crawler.baseURL
      })
    }
    // 信号量限制并行度
    const [, release] = await semaphore.acquire()
    // 捕获单个彩票爬虫的异常，如果出问题了就继续下一个
    try {
      // 启动爬虫，目前有单步爬虫和分步爬虫两种模式
      log.info(`启动爬虫 ${id}`)
      // 多步爬虫模式
      if (crawlerSteps && crawlerSteps > 1) {
        let steps = crawlerSteps
        if (result && result.stepLeft) {
          log.info(`开始 ${id} 的剩余任务，还剩 ${result.stepLeft} 步`)
          steps = crawlerSteps.slice(crawlerSteps.length - result.stepLeft)
        }
        for (const step of steps) {
          // 先判断本步是不是到执行时间了
          if (result && !hasNewDraw(timeRules, step.delay, result.drawTime, tz)) {
            log.debug(`还未到执行本步时间，跳过${id}`)
            return
          }
          const data = await crawler(step.id)
          result = await saveStepData(data, steps, step.id, result)
        }
        // 如果导入成功，则不再使用备用源抓取数据
        break
      }
      // 普通单步爬虫模式
      const data = await crawler.crawl()
      log.debug({ data }, '爬虫结果')
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
            国家: country
          })
      }
      // 将继续尝试该彩票下一个爬虫
    } finally {
      // 释放信号量
      release()
    }
  }
}

module.exports = run
