const cronJob = require('cron').CronJob
const axios = require('axios')
const getCrawler = require('../../crawler/au/latest').getCrawler
const {sleep, rightNow} = require('../../util')
const {innerApi} = require('../../util/api')

class auJob {

    constructor(){
    }

    async start() {
        // this.job = new cronJob('0 */10 * * * *', () => {
            new innerApi().fetchLotteries('au',0).then((data) => {
                if(data && data.length > 0){
                    for(let idx in data){
                        const lottery = data[idx]
                        //根据timeRule判断是否到了抓取数据的时间
                        if(rightNow(lottery.country, lottery.drawConfig.timeRule, lottery.timeZone)){
                            const crawlers = getCrawler(lottery.id)
                            if(crawlers && crawlers.length > 0){
                                crawlers.forEach(crawler => {
                                    new crawler().crawl()
                                })
                                sleep(5000*idx)
                            }
                        }
                        
                    }
                }
            })
        // })
        // this.job.start()
    }
}

module.exports = auJob