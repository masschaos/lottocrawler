const axios = require('axios')
const lotteryIdProductCodeConfig = require('../../../config/const').lotteryIdProductCodeConfig
const { sleep } = require('../../../util/time')
const fs = require('fs')
const path = require('path')
const { max } = require('moment')



class crawler {
    constructor(lottoryId){
        this.lottoryId = lottoryId
    }

    parse(data){

    }

    async crawl(){
        try {
            const filePath = path.join(__dirname, '../../../data/au',this.lottoryId+'.json')
            // if(fs.existsSync(filePath)){
            //     fs.unlinkSync(filePath)
            // }
            fs.writeFileSync(filePath, "")
            this.ws = fs.createWriteStream(filePath, {encoding: "utf-8"})

            const drawNo = await this.getDrawNo() //4065//await this.getDrawNo()

            console.log(drawNo)
            const finalDrawNo = 1
            await this.ws.write("[")
            if(drawNo != null){
                for(let i = drawNo; i >= finalDrawNo; i -= 50){
                    const result = []
                    const maxDrawNo = i
                    const minDrawNo = i-50 < 0 ? 1 : i-50
                    const draws = await this.getDrawRange(minDrawNo, maxDrawNo)

                    console.log(`drawNo: ${drawNo}, finalDrawNo: ${finalDrawNo}, minDrawNo: ${minDrawNo}, maxDrawNo: ${maxDrawNo}`)
                    // console.log(draws.map(a => a.DrawNumber))
                    const percent = parseInt(((maxDrawNo == drawNo) ? (drawNo-minDrawNo)/(drawNo-finalDrawNo) : (drawNo-minDrawNo-1)/(drawNo-finalDrawNo))*100)
                    console.log(`${percent > 100 ? 100 : percent}%`)
                    if(draws != null){
                        draws.forEach(draw => {
                            const item = this.parse(draw)
                            result.push(item)
                        })
                        const json = JSON.stringify(result)
                        await this.ws.write((maxDrawNo == drawNo ? "" : ",")+json.substring(1, json.length-1))
                    }
                    i--
                    sleep(3000)
                }
            }
        } catch (err) {
            console.log(err)
        } finally{
            await this.ws.write("]")
            this.ws.close()
        }

    }

    async getDrawRange(minDrawNo, maxDrawNo){
        return new Promise((resolve, reject) => {
            axios.post("https://data.api.thelott.com/sales/vmax/web/data/lotto/results/search/drawrange",
            {
                "MinDrawNo": minDrawNo,
                "MaxDrawNo": maxDrawNo,
                "Product": lotteryIdProductCodeConfig[this.lottoryId],
                "CompanyFilter": [
                    "NTLotteries"
                ]
            }).then(resp => {
                if(resp.data.Draws && resp.data.Draws.length > 0){
                    resolve(resp.data.Draws)
                }
                resolve(null)
            }).catch(err => {
                reject(err)
            })
        })
    }

    async getDrawNo(){
        return new Promise((resolve, reject) => {
            axios.post("https://data.api.thelott.com/sales/vmax/web/data/lotto/latestresults",
            {
                "CompanyId": "NTLotteries",
                "MaxDrawCountPerProduct": 1,
                "OptionalProductFilter": [lotteryIdProductCodeConfig[this.lottoryId]]
            }).then(resp => {
                // console.log(resp.data)
                if(resp.data.DrawResults && resp.data.DrawResults.length > 0){
                    resolve(resp.data.DrawResults[0].DrawNumber)
                }
                resolve(null)
            }).catch(err => {
                reject(err)
            })
        })
    }
}

module.exports = crawler
