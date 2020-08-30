/**
 * @Author: maple
 * @Date: 2020-08-30 08:36:27
 * @LastEditors: maple
 * @LastEditTime: 2020-08-30 15:30:43
 */
const axios = require('axios')
const moment = require('moment')
const VError = require('verror')
const axiosCookieJarSupport = require('@3846masa/axios-cookiejar-support').default
const tough = require('tough-cookie')

axiosCookieJarSupport(axios)
const cookieJar = new tough.CookieJar()
const { wait } = require('../../../util/time')
const log = require('../../../util/log')

class BrCrawler {
  constructor (config = {}) {
    const { lotteryId } = config
    this.lotteryId = lotteryId
    this.retryTimes = config.retryTimes || 5
    this.waitTime = config.waitTime || 2000
    this._config = config
  }

  formatMoney (text) {
    if (!text) {
      text = ''
    }

    const [integer, tail = ''] = text.toString().split('.')

    return `${integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${('00' + tail).slice(-2, 4)}`
  }

  async queryFile (url) {
    // https://stackoverflow.com/questions/59851293/node-js-simple-get-with-axios-module-throwing-error-max-redirects-exceeded
    // https://www.npmjs.com/package/axios-cookiejar-support
    const resp = await axios.request({
      url: url,
      method: 'GET',
      jar: cookieJar, // tough.CookieJar or boolean
      withCredentials: true // If true, send cookie stored in jar
    })

    const data = resp.data
    if (!data) {
      throw new VError('data is empty')
    }
    return data
  }

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
          log.warn(`br crawler 数值缺失: key: ${key} lotteryId: ${this.lotteryId} data: ${JSON.stringify(data)}`)
        }
      }

      result.push(render ? render(item) : item)
    }
    return result
  }

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

    throw new VError(lastErr, 'br crawler query data error')
  }

  getURL (issue) {
    if (issue === undefined) {
      return `${this.url}?timestampAjax=${moment().valueOf()}`
    }
    return `${this.url}?timestampAjax=${moment().valueOf()}&concurso=${issue}`
  }

  render (data) {
    throw new VError('should implementation')
  }

  async crawl (issue) {
    const url = this.getURL(issue)
    log.debug(`fetch url: ${url}`)
    const data = await this.getData(url)
    const result = this.render(data)
    return result
  }
}

module.exports = BrCrawler
