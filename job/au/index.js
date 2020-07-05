const cronJob = require('cron').CronJob
const axios = require('axios')
const getCrawler = require('../../crawler/au/latest').getCrawler

class auJob {

    constructor(){
    }

    start() {
        console.log("au-job 开始")

        // this.job = new cronJob('0 */1 * * * *', () => {
            console.log("au-job 运行中")
            
            axios.get('https://seaapi.lottowawa.com/staging/lotteries?country=au&level=0').then((resp) => {
                if(resp.data && resp.data.length > 0){
                    const lotteryIds = resp.data.map(a => a.id)
                    for(let idx in lotteryIds){
                        const crawlers = getCrawler(lotteryIds[idx])
                        if(crawlers && crawlers.length > 0){
                            setTimeout(() => {
                                crawlers.forEach(crawler => {
                                    new crawler().crawl()
                                })
                            }, 5000 * idx);
                        }
                    }
                }
            })
        // })
        // this.job.start()
    }
}

module.exports = auJob