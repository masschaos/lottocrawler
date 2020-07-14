const getCrawler = require('../../crawler/au/latest').getCrawler
const { sleep, rightNow, haveCrawledToday } = require('../../util')
const { fetchLotteries, fetchLastestResult } = require('../../inner/api')

class auJob {
  async start () {
    // FIXME: 动态传参
    fetchLotteries('au', 0).then(async (data) => {
      // 获取澳大利亚最新的开奖列表
      let results = []
      try {
        results = await fetchLastestResult('au', 0)
      } catch (error) {
        console.log(error)
      }
      if (data && data.length > 0) {
        for (const idx in data) {
          const lottery = data[idx]
          // 根据预计开奖时间规则(lottery.drawConfig.timeRule)判断是否到了抓取数据的时间 ,
          if (rightNow(lottery.country, '06 19 * * 7', lottery.timeZone)) {
            const result = results.find(a => {
              return a.lotteryID === lottery.id
            })

            // 如果未查询到该彩种的开奖信息或者根据该彩种最新开奖信息中的开奖时间(result.drawTime)判断今天是否已经抓取过
            if (result === undefined || !haveCrawledToday('au', '20200712000000', lottery.timeZone)) {
              const crawlers = getCrawler(lottery.id)
              if (crawlers && crawlers.length > 0) {
                for (const crawlerIdx in crawlers) {
                  const crawler = crawlers[crawlerIdx]
                  try {
                    await new crawler().crawl()
                    // 如果导入成功，则不再使用备用源抓取数据
                    break
                  } catch (error) {
                    // 如果提示数据已存在, 则跳过所有源
                    if (error.error === 'DuplicatedResult') {
                      break
                    }
                    console.log(error)
                  }
                }
                sleep(5000 * idx)
              }
            }
          }
        }
      }
    }).catch(err => {
      console.log(err)
    })
  }
}

module.exports = auJob
