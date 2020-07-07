const cronJob = require('cron').CronJob
const axios = require('axios')
const getCrawler = require('../../crawler/au/latest').getCrawler
const {sleep, compareLocalTime} = require('../../util')
const {innerApi} = require('../../util/api')

class auJob {

    constructor(){
    }

    async start() {
        // this.job = new cronJob('0 */1 * * * *', () => {
            new innerApi().fetchLotteries('au',0).then((data) => {
                if(data && data.length > 0){
                    for(let idx in data){
                        const lottery = data[idx]
                        //如果已经到了该彩种每周的抓取时间,则开始抓取
                        if(compareLocalTime(lottery.country, lottery.drawConfig.timeRule, lottery.timeZone) < 0){
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