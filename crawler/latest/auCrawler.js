const url = require('url');
const axios = require('axios')
const getMapper = require("../../mapper").getMapper

class auCrawler {
    constructor(lotteryId) {
        this.productCodes = {
            "au-tattslotto": "TattsLotto",
            "au-oz-lotto": "OzLotto",
            "au-powerball": "Powerball",
            "au-set-for-life": "SetForLife744",
            "au-mon-wed-lotto": "MonWedLotto",
            "au-super-66": "Super66"
        }
        this.lotteryIds = {
            "TattsLotto": "au-tattslotto",
            "OzLotto": "au-oz-lotto",
            "Powerball": "au-powerball",
            "SetForLife744": "au-set-for-life",
            "MonWedLotto": "au-mon-wed-lotto",
            "Super66": "au-super-66",
        }
        this.lotteryId = lotteryId
        this.productCode = this.productCodes[lotteryId]
    }

    crawl() {
        console.log(`${this.lotteryId} crawl started`)
        //通过接口获取澳大利亚6个彩种的最新数据
        axios.post('https://data.api.thelott.com/sales/vmax/web/data/lotto/latestresults',
            {
                "CompanyId": "NTLotteries",                           //公司id
                "MaxDrawCountPerProduct": 1,                          //每个彩种显示数量
                "OptionalProductFilter": [this.productCode]           //彩种
            }
        )
            .then((resp) => {
                if (resp.data && resp.data.DrawResults) {
                    let arrLottos = []
                    let list = resp.data.DrawResults
                    list.forEach(a => {
                        if (this.lotteryIds[a.ProductId]) {
                            let m = getMapper(this.lotteryIds[a.ProductId])
                            if (m) {
                                arrLottos.push(m(a))
                            }
                        }

                    })
                    this.store(arrLottos)
                }
            })
            .catch((err) => {
                console.log(err)
            })
    }

    store(data) {
        if (data && data.length > 0) {
            console.log(`${this.lotteryId} store started`)
            for (let idx in data) {
                const item = data[idx]
                console.log(item)
                axios.post(url.resolve(process.env.BASE_URL, "/results"), item, {
                    headers: {
                        "Authorization": "Bearer xxxxxx",
                        "Content-Type": "application/json"
                    },
                }).then((resp) => {
                    console.log(resp.data)
                }).catch((err) => {
                    console.log(err.response.data)
                })
            }
        }
    }
}

module.exports = auCrawler