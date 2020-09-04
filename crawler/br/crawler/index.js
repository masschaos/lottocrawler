/**
 * @Author: maple
 * @Date: 2020-08-30 08:36:27
 * @LastEditors: maple
 * @LastEditTime: 2020-09-02 00:01:02
 */
const axios = require('axios')
const moment = require('moment')
const VError = require('verror')
const axiosCookieJarSupport = require('@3846masa/axios-cookiejar-support').default
const tough = require('tough-cookie')

// https://stackoverflow.com/questions/59851293/node-js-simple-get-with-axios-module-throwing-error-max-redirects-exceeded
// https://www.npmjs.com/package/axios-cookiejar-support
// 请求需要保存 cookie ，否则会不停的 redirect
axiosCookieJarSupport(axios)
const cookieJar = new tough.CookieJar()
const { wait } = require('../../../util/time')
const log = require('../../../util/log')

class BrCrawler {
  constructor (config = {}) {
    const { lotteryID } = config
    this.lotteryID = lotteryID // lotteryID
    this.retryTimes = config.retryTimes || 5 // 请求失败重试次数，这个网站失败率极高
    this.waitTime = config.waitTime || 2000 // 请求失败之后，重试时间
    this._config = config
  }

  // 格式化 money
  // 11111.1 => 11.111,10 // 注意小数分割符是 ,
  formatMoney (text) {
    if (!text) {
      text = ''
    }

    let [integer, tail = ''] = text.toString().trim().split('.')

    if (integer === '') {
      integer = '0'
    }

    const result = `${integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${(tail + '00').slice(0, 2)}`

    return result
  }

  // 根据 URL 请求 JSON File
  async queryFile (url) {
    // https://stackoverflow.com/questions/59851293/node-js-simple-get-with-axios-module-throwing-error-max-redirects-exceeded
    // https://www.npmjs.com/package/axios-cookiejar-support
    const resp = await axios.request({
      url: url,
      method: 'GET',
      timeout: 10000,
      jar: cookieJar, // tough.CookieJar or boolean
      withCredentials: true // If true, send cookie stored in jar
    })

    const data = resp.data
    if (!data) {
      throw new VError('data is empty')
    }
    return data
  }

  // 根据 configs 的 key，对 data 的数据进行输出。
  // 如果 config 里包含 render 函数
  // 直接对 value 进行 render 处理
  getValues (data, configs) {
    const keys = Object.keys(configs).sort((key1, key2) =>
      parseInt(key1) - parseInt(key2))
    const result = []
    for (const k of keys) {
      const config = configs[k]
      let render
      let key = config
      if (typeof key === 'object') {
        render = key.render
        key = key.key
      }

      const item = data[key]

      if (item === undefined || item === null) {
        if (key !== 'ganhadoresPorUf') {
          log.warn(`br crawler 数值缺失: key: ${key} lotteryID: ${this.lotteryID} data: ${JSON.stringify(data)}`)
        }
      }

      result.push(render ? render(item) : item)
    }
    return result
  }

  // retry 逻辑
  // 此网站 500 概率极高
  // 默认爬取 5 次
  async getData (url) {
    let data
    let lastErr
    for (let i = 0; i < this.retryTimes; i++) {
      try {
        data = await this.queryFile(url)
        if (data) {
          return data
        }
      } catch (err) {
        lastErr = err
        log.warn(err, 'br crawler query data error')
        await wait(this.waitTime)
      }
    }

    throw new VError(lastErr, `br crawler query data error URL: ${url}`)
  }

  // 在 URL 添加 issue & timestamp
  // 如果 issue 不存在，会返回错误数据（表现为所有数据为 null）而不是返回报错
  getURL (issue) {
    if (issue === null || issue === undefined || isNaN(parseInt(issue))) {
      return `${this.url}?timestampAjax=${moment().valueOf()}`
    }
    return `${this.url}?timestampAjax=${moment().valueOf()}&concurso=${issue}`
  }

  // 根据把获得的 data 数据渲染到 template 上。
  // 因为项目没有依赖 lodash，所以直接处理成字符串
  // 子类上自己实现
  render (data) {
    throw new VError('should implementation')
  }

  // main
  async crawl (issue) {
    const url = this.getURL(issue)
    log.debug(`fetch url: ${url}`)
    const data = await this.getData(url)
    const result = this.render(data)
    return result
  }
}

module.exports = BrCrawler
