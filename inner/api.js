const VError = require('verror')
const axios = require('axios')
const { config, lotteryIdProductCodeConfig } = require('../config')
const im = require('../util/im')

const { baseURL, token } = config

const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: { Authorization: 'Bearer ' + token }
})

async function fetchSystemConfig () {
  try {
    const res = await api.get('system/config')
    return res.data
  } catch (err) {
    throw new VError(err, '请求系统配置出错')
  }
}

async function fetchLotteries (country, level) {
  try {
    const res = await api.get('lotteries',
      {
        params: {
          country,
          level
        }
      })
    return res.data
  } catch (err) {
    // TODO: 分拣参数错误
    throw new VError(err, '请求彩种信息出错')
  }
}

async function fetchLastestResult (country, level) {
  try {
    const res = await api.get('results',
      {
        params: {
          country,
          level
        }
      })
    return res.data
  } catch (err) {
    // TODO: 分拣参数错误
    throw new VError(err, '请求最新结果列表出错')
  }
}

async function saveLastestResult (data) {
  try {
    await api.post('results', data)
  } catch (err) {
    if (err.response) {
      if (err.response.error === 'DuplicatedResult') {
        im.error('向服务端发送了一个重复结果，请检查爬虫策略' + '\n```' + data + '```')
        return
      }
      if (err.response.error === 'InvalidRequestBody') {
        im.error('提交了一个错误的结果，请检查爬虫实现' + '\n```' + data + '```')
        return
      }
      if (err.response.error === 'InvalidRequestBody') {
        im.error('提交了一个未知彩种，请检查爬虫' + '\n```' + data + '```')
        return
      }
    }
    throw new VError(err, '向服务端提交结果数据出错')
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
  fetchSystemConfig,
  fetchLotteries,
  fetchLastestResult,
  saveLastestResult
}
