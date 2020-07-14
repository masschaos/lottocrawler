const {auCrawlerApi,innerApi}= require('../../../util/api')

class auCrawler {
    constructor(lotteryId){
        this.lotteryId = lotteryId
    }

    parse(data){
        return ''
    }

    crawl(){
        return new Promise(async (resolve, reject) =>{
            try {
                reject("失败原因")
                return
                const data = await new auCrawlerApi().fetchLastestResult(this.lotteryId)
                if(data && data.length > 0){
                    for(let idx in data){
                        const item = this.parse(data[idx])
                        console.log(item)
                        await new innerApi().saveLastestResult(item)
                    }
                }
                resolve()
            } catch (error) {
                reject(error)
            }
        })
    }
}

module.exports = auCrawler