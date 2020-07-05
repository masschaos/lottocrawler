const axios = require('axios')
const lottorIdProductCodeConfig = require('../../../config/const').lottorIdProductCodeConfig
const sleep = require('../../../util').sleep
const fs = require('fs')
const path = require('path')



class crawler {
    constructor(lottoryId){
        this.lottoryId = lottoryId
        const filePath = path.join(__dirname, '../../../data/au',lottoryId+'.json')
        fs.writeFileSync(filePath, "")
        this.ws = fs.createWriteStream(filePath, {encoding: "utf-8"})
    }

    parse(data){
        
    }

    async crawl(){
        try {
            const drawNo = 3249 //4065//await this.getDrawNo()
            const result = []
            console.log(drawNo)
            const finalDrawNo = 1
            await this.ws.write("[")
            if(drawNo != null){
                for(let i = drawNo; i >= finalDrawNo; i -= 50){
                    const maxDrawNo = i
                    const minDrawNo = i-50 < 0 ? 1 : i-50
                    const draws = await this.getDrawRange(minDrawNo, maxDrawNo)
                    console.log(`drawNo: ${drawNo}, finalDrawNo: ${finalDrawNo}, minDrawNo: ${minDrawNo}, maxDrawNo: ${maxDrawNo}`)
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
                    await sleep(3000)
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
                "Product": lottorIdProductCodeConfig[this.lottoryId],
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
                "OptionalProductFilter": [lottorIdProductCodeConfig[this.lottoryId]]
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