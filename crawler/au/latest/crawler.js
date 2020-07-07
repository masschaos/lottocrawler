const {auCrawlerApi,innerApi}= require('../../../util/api')

class auCrawler {
    constructor(lotteryId){
        this.lotteryId = lotteryId
    }

    parse(data){
        return ''
    }

    async crawl(){
        try {
            const data = await new auCrawlerApi().fetchLastestResult(this.lotteryId)
            if(data && data.length > 0){
                for(let idx in data){
                    const item = this.parse(data[idx])
                    console.log(item)
                    await new innerApi().saveLastestResult(item)
                }
            }
        } catch (error) {
            console.log(error)
        }
    }
}

module.exports = auCrawler