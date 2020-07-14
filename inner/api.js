const VError = require('verror')
const axios = require('axios')
const { config, lotteryIdProductCodeConfig } = require('../config')

const { baseURL, token } = config

const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: { Authorization: 'Bearer ' + token }
})

class innerApi {
  async fetchSystemConfig () {
    try {
      const res = await api.get('system/config')
      return res.data
    } catch (err) {
      throw new VError(err, '请求系统配置出错')
    }
  }

  async fetchLotteries (country, level) {
    return await api.get('lotteries',
      {
        params: {
          country,
          level
        }
      })
  }

  fetchLastestResult (country, level) {
    return new Promise((resolve, reject) => {
      axios.get(`${process.env.BASE_URL}/results`,
        {
          params: {
            country,
            level
          }
        }, {
          headers: {
            Authorization: 'Bearer xxxxxx',
            'Content-Type': 'application/json'
          }
        }).then((resp) => {
        resolve(resp.data)
      }).catch((err) => {
        reject(err.response.data)
      })
    })
  }

  saveLastestResult (data) {
    return new Promise((resolve, reject) => {
      axios.post(`${process.env.BASE_URL}/results`, data, {
        headers: {
          Authorization: 'Bearer xxxxxx',
          'Content-Type': 'application/json'
        }
      }).then((resp) => {
        resolve(resp.data)
      }).catch((err) => {
        reject(err.response.data)
      })
    })
  }
}

class auCrawlerApi {
  fetchLastestResult (lotteryId) {
    return new Promise((resolve, reject) => {
      axios.post(`${auCrawlerApiBaseUrl}/latestresults`,
        {
          CompanyId: 'NTLotteries', // 公司id
          MaxDrawCountPerProduct: 1, // 每个彩种显示数量
          OptionalProductFilter: [lotteryIdProductCodeConfig[lotteryId]] // 彩种
        })
        .then((resp) => {
          if (resp.data && resp.data.DrawResults) {
            resolve(resp.data.DrawResults)
          }
        })
        .catch((err) => {
          reject(err)
        })
    })
  }

  fetchDrawRangeResult (lotteryId, drawNo) {
    return new Promise((resolve, reject) => {
      axios.post(`${auCrawlerApiBaseUrl}/results/search/drawrange`,
        {
          MinDrawNo: drawNo,
          MaxDrawNo: drawNo,
          Product: lotteryIdProductCodeConfig[lotteryId],
          CompanyFilter: [
            'NTLotteries'
          ]
        })
        .then((resp) => {
          if (resp.data && resp.data.Draws) {
            resolve(resp.data.Draws)
          }
        })
        .catch((err) => {
          reject(err)
        })
    })
  }
}

module.exports = {
  auCrawlerApi,
  innerApi
}
