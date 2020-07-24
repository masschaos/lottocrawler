const VError = require('verror')
const axios = require('axios')


async function getLastestResult (url, lotteryId, params) {
  try {
    console.log("url==", url)
    const resp = await axios.get(url, {params:params})
    if (resp.data ) {
      return resp.data
    }
  } catch (err) {
    throw new VError(err, `${lotteryId}获取最新结果出错`)
  }
}

module.exports = {
  getLastestResult,
}
