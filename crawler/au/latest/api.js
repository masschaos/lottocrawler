const VError = require('verror')
const axios = require('axios')
const { baseURL, lotteryIdProductCodeConfig } = require('./config')

async function fetchLastestResult (lotteryId) {
  try {
    const resp = await axios.post(`${baseURL}/latestresults`,
      {
        CompanyId: 'NTLotteries', // 公司id
        MaxDrawCountPerProduct: 1, // 每个彩种显示数量
        OptionalProductFilter: [lotteryIdProductCodeConfig[lotteryId]] // 彩种
      })
    if (resp.data && resp.data.DrawResults) {
      return resp.data.DrawResults
    }
  } catch (err) {
    throw new VError(err, `${lotteryId}获取最新结果出错`)
  }
  throw new VError(`${lotteryId}获取最新结果未出错，但其中不包含开奖结果，可能接口有改变。`)
}

async function fetchDrawRangeResult (lotteryId, drawNo) {
  try {
    const resp = await axios.post(`${baseURL}/results/search/drawrange`,
      {
        MinDrawNo: drawNo,
        MaxDrawNo: drawNo,
        Product: lotteryIdProductCodeConfig[lotteryId],
        CompanyFilter: [
          'NTLotteries'
        ]
      })
    if (resp.data && resp.data.Draws) {
      return resp.data.Draws
    }
  } catch (err) {
    throw new VError(err, `${lotteryId}获取指定结果${drawNo}出错`)
  }
  throw new VError(`${lotteryId}获取指定结果${drawNo}未出错，但其中不包含开奖结果，可能接口有改变。`)
}

module.exports = {
  fetchDrawRangeResult,
  fetchLastestResult
}
