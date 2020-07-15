const cronJob = require('cron').CronJob
const axios = require('axios')
const getCrawler = require('../../crawler/au/latest').getCrawler
const {sleep, rightNow, haveCrawledToday} = require('../../util')
const logger = require('../../util/logger')
const {innerApi} = require('../../util/api')

class auJob {

    constructor(){
    }

    async start() {
        // 尽可能少的爬源，降低被封概率,10分钟检查一次
        this.job = new cronJob('0 */10 * * * *', () => {
            new innerApi().fetchLotteries('au',0).then(async (data) => {
                //获取澳大利亚最新的开奖列表
                let results = []
                try {
                    results = await new innerApi().fetchLastestResult('au', 0)
                } catch (error) {
                    log.error(error)
                }
                if(data && data.length > 0){
                    for(let idx in data){
                        const lottery = data[idx]
                        //根据预计开奖时间规则(lottery.drawConfig.timeRule)判断是否到了抓取数据的时间 ,
                        if(rightNow(lottery.country, '06 19 * * 7', lottery.timeZone)){
                            const result = results.find(a => {
                                return a.lotteryID == lottery.id
                            })

                            //如果未查询到该彩种的开奖信息或者根据该彩种最新开奖信息中的开奖时间(result.drawTime)判断今天是否已经抓取过
                            if(result == undefined || !haveCrawledToday('au', "20200712000000", lottery.timeZone)){
                                const crawlers = getCrawler(lottery.id)
                                if(crawlers && crawlers.length > 0){
                                    for(let crawlerIdx in crawlers){
                                        const crawler = crawlers[crawlerIdx]
                                        try {
                                            await new crawler().crawl()
                                            //如果导入成功，则不再使用备用源抓取数据
                                            logger.info(`${lottery.id} 数据爬取成功`)
                                            break
                                        } catch (error) {
                                            console.log(error)
                                            //如果提示数据已存在, 则跳过所有源
                                            if(error.error && error.error == "DuplicatedResult"){
                                                break
                                            }
                                        
                                            if(`${error}`.indexOf('TimeoutError') > -1){
                                                logger.error(`${lottery.id} 数据爬取失败: 浏览器超时`)
                                                break
                                            }

                                            logger.error(`${lottery.id} 数据爬取失败: ${error}`)
                                        }
                                    }
                                    sleep(5000*idx)
                                }
                            }
                        }
                    }
                }
            }).catch(error => {
                console.log(error)
            })
        })
        this.job.start()
    }
}

process.on('uncaughtException', function (err) {
    //打印出错误
    console.log(err)
    //打印出错误的调用栈方便调试
    console.log(err.stack)
})

module.exports = auJob