const axios = require('axios')

class auCrawler {
    constructor(lotteryId){
        this.productCodes = {
            "au-tattslotto": "TattsLotto",
            "au-oz-lotto": "OzLotto",
            "au-powerball": "Powerball",
            "au-set-for-life": "SetForLife744",
            "au-mon-wed-lotto": "MonWedLotto",
            "au-super-66": "Super66"
        }
        this.lotteryIds = {
            "TattsLotto":"au-tattslotto",
            "OzLotto":"au-oz-lotto",
            "Powerball":"au-powerball",
            "SetForLife744":"au-set-for-life",
            "MonWedLotto":"au-mon-wed-lotto",
            "Super66":"au-super-66",
        }
        this.lotteryId = lotteryId
        this.productCode = this.productCodes[lotteryId]
    }

    parse(data){
        return ''
    }

    crawl(){
        console.log(`[主要源]${this.lotteryId} 开始爬取`)
        //通过接口获取澳大利亚6个彩种的最新数据
        axios.post('https://data.api.thelott.com/sales/vmax/web/data/lotto/latestresults',
            {
                "CompanyId": "NTLotteries",                           //公司id
                "MaxDrawCountPerProduct": 1,                          //每个彩种显示数量
                "OptionalProductFilter": [this.productCode]           //彩种
            }
        )
        .then((resp)=>{
            if(resp.data && resp.data.DrawResults){
                let data = []
                let list = resp.data.DrawResults
                list.forEach(a => {
                    data.push(this.parse(a))
                })
                console.log(`[主要源]${this.lotteryId} 爬取成功: ${JSON.stringify(data)}`)
                this.store(data)
            }
        })
        .catch((err)=> {
            console.log(`[主要源]${this.lotteryId} 爬取失败: ${err}`)
        })
    }

    store(data){
        if(data && data.length > 0){
            console.log(`[主要源]${this.lotteryId} 开始存储: ${JSON.stringify(data)}`)
            for(let idx in data){
                const item = data[idx]
                axios.post("https://seaapi.lottowawa.com/staging/results", item, {
                    headers:{
                        "Authorization": "Bearer xxxxxx",
                        "Content-Type" : "application/json"
                    },
                }).then((resp) => {
                    console.log(`[主要源]${this.lotteryId} 存储成功`)
                }).catch((err) => {
                    if(err.response.data.error && err.response.data.error == 'DuplicatedResult'){
                        console.log(`[主要源]${this.lotteryId} 存储失败: 重复数据`)
                      } else {
                        console.log(`[主要源]${this.lotteryId} 存储失败: ${err.response.data}`)
                      }
                })
            }
        }
    }
}

module.exports = auCrawler