const axios = require("axios")
const {innerApiBaseUrl, auCrawlerApiBaseUrl, lotteryIdProductCodeConfig} = require('../config/const')

class innerApi {
    fetchLotteries(country, level){
        return new Promise((resolve, reject) => {
            axios.get(`${innerApiBaseUrl}/lotteries`, 
            {params:{
                country,
                level
            }}, {
                headers:{
                    "Authorization": "Bearer xxxxxx",
                    "Content-Type" : "application/json"
                },
            }).then((resp) => {
                resolve(resp.data)
            }).catch((err) => {
                reject(err.response.data)
            })
        })
    }

    saveLastestResult(data){
        return new Promise((resolve, reject) => {
            axios.post(`${innerApiBaseUrl}/results`, data, {
                headers:{
                    "Authorization": "Bearer xxxxxx",
                    "Content-Type" : "application/json"
                },
            }).then((resp) => {
                resolve(resp.data)
            }).catch((err) => {
                reject(err.response.data)
            })
        })
    }
}

class auCrawlerApi {

    fetchLastestResult(lotteryId) {
        return new Promise((resolve, reject) => {
            axios.post(`${auCrawlerApiBaseUrl}/latestresults`,
            {
                "CompanyId": "NTLotteries",                                                 //公司id
                "MaxDrawCountPerProduct": 1,                                                //每个彩种显示数量
                "OptionalProductFilter": [lotteryIdProductCodeConfig[lotteryId]]            //彩种
            })
            .then((resp)=>{
                if(resp.data && resp.data.DrawResults){
                    resolve(resp.data.DrawResults)
                }
            })
            .catch((err)=> {
                reject(err)
            })
        })
    }
}

module.exports = {
    auCrawlerApi,
    innerApi
}