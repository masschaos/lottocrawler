/**
 * @Author: maple
 * @Date: 2020-08-14 21:30:13
 * @LastEditors: maple
 * @LastEditTime: 2020-09-03 00:48:41
 */
const VError = require('verror')
const moment = require('moment')
// const log = require('../../../util/log')
const crawl = require('./fr-index')
const { getMonth } = require('./date')
const { DrawingError } = require('../../../util/error')

// url 获取
const urlSelector = async function (page) {
  const f = await page.$('#keno-results')
  const urls = await f.$$eval('.btn-content > a', els => els.map(el => el.href))

  if (!urls.length) {
    throw new VError('urls 爬取失败 fr-loto 缺失 urls 为空')
  }

  const noSharp = urls.filter(url => url.indexOf('#') === -1)
  return noSharp[0] || urls[0]
}

// 默认基础数据
const data = {
  name: 'KENO GAGNANTÀVIE',
  lotteryID: 'fr-keno-gagnantavie'
}

// 页面数据整理
const interpreter = async function (page) {
  const result = {
    drawTime: '',
    numbers: null,
    jackpot: [],
    breakdown: [],
    other: [],
    name: data.name,
    lotteryID: data.lotteryID,
    issue: ''
  }

  // date
  const url = data.url
  const id = url.split('/').pop()
  const dateTmp = id.split('-')
  const year = dateTmp[3]
  const day = dateTmp[1]
  const month = getMonth(dateTmp[2])

  // numbers
  const lotoResult = await page.$('#keno-results')
  const numbersContents = await lotoResult.$$('.numbers-content')

  if (!numbersContents.length) {
    throw new VError('彩票数据为空')
  }

  let night = false
  if (numbersContents[1]) {
    night = true // 晚上场
    const numbersContent = numbersContents[1]
    const multiplier = await (await numbersContent.$('span.numbers-Period_multipli-num')).evaluate(el => el.innerText)
    const numbersWrapper = await numbersContent.$('.numbers-wrapper')
    const numbers = await numbersWrapper.$$eval('div.numbers-item > span.numbers-item_num', els => els.map(el => el.innerText))
    const bonusNum = (await numbersWrapper.$eval('span.numbers-bonus_num', el => el.innerText)).replace(/ /g, '')
    result.numbers = `${numbers.join(',')}|${bonusNum}`
    const date = moment()
    date.set('years', year)
    date.set('months', month - 1)
    date.set('date', day)
    result.drawTime = date.format('YYYYMMDD200500') // 晚上抽奖在下午 8：05 左右
    // 倍数
    result.other.push({
      name: 'multiplier',
      value: multiplier.slice(1)
    })
  } else if (numbersContents[0] && !night) {
    // 下午场
    const numbersContent = numbersContents[0]
    const multiplier = await (await numbersContent.$('span.numbers-Period_multipli-num')).evaluate(el => el.innerText)
    const numbersWrapper = await numbersContent.$('.numbers-wrapper')
    const numbers = await numbersWrapper.$$eval('div.numbers-item > span.numbers-item_num', els => els.map(el => el.innerText))
    const bonusNum = (await numbersWrapper.$eval('span.numbers-bonus_num', el => el.innerText)).replace(/ /g, '')

    if (!bonusNum || isNaN(parseInt(bonusNum))) {
      throw new DrawingError(`${data.lotteryID} crawler lack of bonus number`)
    }

    result.numbers = `${numbers.join(',')}|${bonusNum}`
    const date = moment()
    date.set('years', year)
    date.set('months', month - 1)
    date.set('date', day)
    result.drawTime = date.format('YYYYMMDD130500') // 中午抽奖在下午 1：05 左右
    // 倍数
    result.other.push({
      name: 'multiplier',
      value: multiplier.slice(1)
    })
  }

  const prizesTable = await page.$('.prizes-table')
  const prizesContentWraper = await prizesTable.$('.prizes-table_wrapper')
  const items = await prizesContentWraper.$$('.prizes-table_content')

  items.shift() // 前面两层数据不需要,两层都是标题
  const names = await items.shift().$$eval('.prizes-table_item', els => els.map(el => el.innerText))
  names.shift()
  names.shift() // 抛弃两层

  for (const item of items) {
    const tmps = await item.$$('.prizes-table_content-col')
    const name = await tmps[0].$eval('div', el => el.innerText)

    // breakdown
    const breakdown = {
      name: `${name} n°`,
      detail: []
    }

    const ts = await tmps[1].$$('.prizes-table_subitem-container')

    for (const t of ts) {
      const _detail = {
        name: null,
        value: null
      }
      const mts = await t.$$('.prizes-table_subitem')
      _detail.name = await mts.shift().evaluate(el => el.innerText)
      const values = []
      for (let i = 0; i < mts.length; i++) {
        const mt = mts[i]
        const text = await mt.$eval('p', el => el.innerText)
        values.push(`${names[i]}:${text}`)
      }
      _detail.value = values.join('|').replace(/\n/g, '')
      breakdown.detail.push(_detail)
    }
    result.breakdown.push(breakdown)
  }

  return result
}

async function main () {
  const result = await crawl(data, urlSelector, interpreter)
  return result
}

module.exports = {
  crawl: main
}
