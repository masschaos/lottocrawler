const url = require('url');
const cronJob = require('cron').CronJob
const axios = require('axios')
const getCrawler = require('../crawler/latest').getCrawler

class auJob {

    constructor() {
    }

    start() {
        console.log("au-job started")

        this.job = new cronJob('0 */1 * * * *', () => {
            console.log("au-job runing")

            axios.get(url.resolve(process.env.BASE_URL, '/lotteries?country=au&level=0')).then((resp) => {
                if (resp.data && resp.data.length > 0) {
                    const lotteryIds = resp.data.map(a => a.id)
                    for (let idx in lotteryIds) {
                        const crawler = getCrawler(lotteryIds[idx])
                        if (crawler) {
                            setTimeout(() => {
                                new crawler().crawl()
                            }, 5000 * idx);
                        }
                    }
                }
            })
        })
        this.job.start()
    }
}

module.exports = auJob