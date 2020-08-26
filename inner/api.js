const VError = require('verror')
const axios = require('axios')
const { DrawingError } = require('../util/error')
const { baseURL, token } = require('../config')
const im = require('../util/im')
const log = require('../util/log')

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
    throw new VError(err, '请求彩种信息出错')
  }
}

async function fetchLatestResult (country, level) {
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
    throw new VError(err, '请求最新结果列表出错')
  }
}

async function saveLatestResult (data) {
  try {
    const res = await api.post('results', data)
    return res.data
  } catch (err) {
    if (err.response && err.response.status >= 400 && err.response.data) {
      switch (err.response.data.error) {
        case 'DuplicatedResult':
          im.error('向服务端发送了一个重复结果，请检查爬虫策略' + '\n```' + JSON.stringify(data) + '```')
          break
        case 'InvalidRequestBody':
          im.error('提交了一个错误的结果，请检查爬虫实现' + '\n```' + JSON.stringify(data) + '```')
          break
        case 'InvalidLotteryID':
          im.error('提交了一个未知彩种，请检查爬虫' + '\n```' + JSON.stringify(data) + '```')
          break
        default:
          im.error('保存结果时触发了未知错误，data:' + '\n```' + JSON.stringify(data) + '```' +
            '\nresponse:\n```' + JSON.stringify(err.response.data) + '```')
      }
    }
    throw new VError(err, '向服务端提交结果数据出错')
  }
}

// 保存额外结果，需要传入 result id
async function saveExtraResult (id, data) {
  try {
    const res = await api.put(`results/${id}/extra`, data)
    return res.data
  } catch (err) {
    if (err.response && err.response.status === 400 && err.response.data) {
      switch (err.response.data.error) {
        case 'InvalidRequestBody':
          im.error('提交了一个错误的结果，请检查爬虫实现' + '\n```' + JSON.stringify(data) + '```')
          break
        default:
          im.error('保存结果时触发了未知错误，data:' + '\n```' + JSON.stringify(data) + '```' +
            '\nresponse:\n```' + JSON.stringify(err.response.data) + '```')
      }
    }
    throw new VError(err, '向服务端提交结果数据出错')
  }
}

// 通过步数定义和当前步，作出一个上报数据结构，并上报。
// 根据当前步的类型，决定 数据结构的字段。
// 参数 result 为从服务端拉来的最新结果
async function saveStepData (data, steps, stepID, result) {
  // 首先，根据当前步数准备数据
  let step
  let stepLeft = 0
  let isResultOK = true
  let isBreakdownOK = true
  let found = false
  for (const [i, st] of steps.entries()) {
    if (!found) {
      if (st.id === stepID) {
        log.debug(`开始分步抓取，第 ${i + 1} 步, 共 ${steps.length} 步 ${stepID}。`)
        found = true
        step = st
        if (i === 0) {
          // 第一步检查期号是不是新的
          if (result && data.drawTime <= result.drawTime) {
            throw new DrawingError(data.lotteryID)
          }
        } else {
          // 不是第一步必须有 result
          if (!result) {
            throw new VError('执行后续任务时服务器不存在最新结果')
          }
          // 不是第一步期号必须一致
          if (result.drawTime !== data.drawTime) {
            throw new VError('执行后续任务时提交数据与服务器最新数据期号不一致')
          }
        }
      }
      continue
    }
    // 在当前步骤之后
    // 累计剩余了多少步
    stepLeft++
    // 如果还有 result 或者 other 没提交，则 Result 没有最终完成
    if (st.dataType === 'result' || st.dataType === 'other') {
      isResultOK = false
    }
    // 如果还有 breakdown 未提交，则 Breakdown 对象没有最终完成
    if (st.dataType === 'breakdown') {
      isBreakdownOK = false
    }
  }

  // 最后，根据数据类型提交数据
  // TODO: 提交前要检查结果是否符合要求
  switch (step.dataType) {
    case 'result':
      data.stepLeft = stepLeft
      data.isResultOK = isResultOK
      data.isBreakdownOK = isBreakdownOK
      return await saveLatestResult(data)
    case 'breakdown':
      return await saveExtraResult(result.id, {
        stepLeft,
        isResultOK,
        isBreakdownOK,
        hasBreakdown: true,
        breakdown: data.breakdown
      })
    case 'other':
      return await saveExtraResult(result.id, {
        stepLeft,
        isResultOK,
        isBreakdownOK,
        breakdown: data.other
      })
    default:
      throw new VError(`解析步骤时碰到错误的数据类型：${step.dataType}`)
  }
}

module.exports = {
  fetchSystemConfig,
  fetchLotteries,
  fetchLatestResult,
  saveLatestResult,
  saveStepData
}
