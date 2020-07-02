const axios = require('axios')
const mappers = require('./mapper')

const products = [
    "TattsLotto"
    // ,"OzLotto"
    // ,"Powerball"
    // ,"SetForLife744"
    // ,"MonWedLotto"
    // ,"Super66"
]

//通过接口获取澳大利亚6个彩种的最新数据
axios.post('https://data.api.thelott.com/sales/vmax/web/data/lotto/latestresults',
    {
        "CompanyId": "NTLotteries",                 //公司id
        "MaxDrawCountPerProduct": 1,                //每个彩种显示数量
        "OptionalProductFilter": products           //彩种
    }
)
.then((resp)=>{
    if(resp.data && resp.data.DrawResults){
        let arrLottos = []
        let list = resp.data.DrawResults
        list.forEach(a => {
            let m = mappers.get(a.ProductId)
            if(m){
                // console.log(JSON.stringify(m(a)))
                arrLottos.push(m(a))
            }
        })
        // console.log(arrLottos)
        storeData(arrLottos)
    }
})
.catch((err)=> {
    console.log(err)
})

function storeData(data){
    if(data && data.length > 0){
        for(idx in data){
            const item = data[idx]
            // console.log(data[idx])
            axios.post("https://seaapi.lottowawa.com/staging/results", item, {
                headers:{
                    "Authorization": "Bearer xxxxxx",
                    "Content-Type" : "application/json"
                },
            }).then((resp) => {
                console.log(resp.data)
            }).catch((err) => {
                console.log(err.response.data)
            })
        }
    }
}