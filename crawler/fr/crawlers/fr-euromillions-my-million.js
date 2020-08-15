/**
 * @Author: maple
 * @Date: 2020-08-14 21:29:57
 * @LastEditors: maple
 * @LastEditTime: 2020-08-15 21:37:26
 */
const moment = require('moment')
const VError = require('verror')
const crawl = require('./fr-index')
const { getMonth } = require('./date')

// 处理 URL 爬取
const urlSelector = async function (page) {
  const f = await page.$('#euromillions-results')
  const urls = await f.$$eval('.btn-content > a', els => els.map(el => el.href))

  if (!urls.length) {
    throw new VError('urls 爬取失败 fr-loto 缺失 urls 为空')
  }

  const noSharp = urls.filter(url => url.indexOf('#') === -1)
  return noSharp[0] || urls[0]
}

// 基础数据
const data = {
  lotteryID: 'fr-euromillions-my-million',
  name: 'EuroMillions-My million'
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
  const euromillionsResults = await page.$('#euromillions-results')
  const numbersWrapper = await euromillionsResults.$('.numbers-wrapper')
  const numbers = await numbersWrapper.$$eval('div.numbers-item > span.numbers-item_num', els => els.map(el => el.innerText))

  const specialContent = await euromillionsResults.$('.numbers-item_content-special')
  const starNumbers = await specialContent.$$eval('div.numbers-item > div.star-wrapper > span.star-num', els => els.map(el => el.innerText))
  const bonusNumber = (await (await euromillionsResults.$('span.numbers-bonus_num')).evaluate(el => el.innerText)).replace(/ /g, '')
  result.numbers = `${numbers.join(',')}|${starNumbers.join(',')}|${bonusNumber}`

  // breakdown
  const breakdown = {
    name: 'main',
    detail: []
  }

  const name1 = 'Bons n°'
  const name2 = 'Grilles gagnantes en France'
  const name3 = 'Grilles gagnantes en Europe'
  const name4 = 'Gains EuroMillions®'
  const name5 = 'Grilles gagnantes Etoile+'
  const name6 = 'Gains Etoile+'
  const name7 = 'Gains EuroMillions® Etoile+'

  const prizesTable = await page.$('.prizes-table')
  const prizesContentWraper = await prizesTable.$('.prizes-table_expand-container')
  const items = await prizesContentWraper.$$('.prizes-table_content')
  items.shift()

  for (const item of items) {
    const tmps = await item.$$('div')
    const tmp1 = await tmps[0].$$eval('span', els => els.map(el => el.innerText).join(''))
    const tmp2 = await tmps[1].evaluate(el => el.innerText)
    const tmp3 = await tmps[2].evaluate(el => el.innerText)
    const tmp4 = await tmps[3].evaluate(el => el.innerText)
    const tmp5 = await tmps[4].evaluate(el => el.innerText)
    const tmp6 = await tmps[5].evaluate(el => el.innerText)
    const tmp7 = await tmps[6].evaluate(el => el.innerText)

    breakdown.detail.push([
      { name: name1, value: tmp1 },
      { name: name2, value: tmp2 },
      { name: name3, value: tmp3 },
      { name: name4, value: tmp4 },
      { name: name5, value: tmp5 },
      { name: name6, value: tmp6 },
      { name: name7, value: tmp7 }
    ])
  }

  result.breakdown.push(breakdown)
  const date = moment()
  date.set('years', year)
  date.set('months', month - 1)
  date.set('date', day)
  result.drawTime = date.format('YYYYMMDD210500')
  return result
}

async function main () {
  const result = await crawl(data, urlSelector, interpreter)
  return result
}

module.exports = {
  crawl: main
}
