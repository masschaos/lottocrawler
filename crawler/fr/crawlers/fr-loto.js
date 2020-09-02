/**
 * @Author: maple
 * @Date: 2020-08-14 21:29:48
 * @LastEditors: maple
 * @LastEditTime: 2020-08-16 02:47:21
 */
const moment = require('moment')
const VError = require('verror')
const log = require('../../../util/log')
const crawl = require('./fr-index')
const { getMonth } = require('./date')

const data = {
  lotteryID: 'fr-loto',
  name: 'Loto'
}

// 页面数据分析整理
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
  const lotoResult = await page.$('#loto-results')
  const numbersWrapper = await lotoResult.$('.numbers-wrapper')
  const numbers = await numbersWrapper.$$eval('div.numbers-item > span.numbers-item_num', els => els.map(el => el.innerText))
  const bonusNum = (await numbersWrapper.$eval('span.numbers-bonus_num', el => el.innerText)).replace(/ /g, '')
  const secondDraw = await lotoResult.$('.numbers-wrapper-second-draw')
  const secondDrawNumbers = await secondDraw.$$eval('div.numbers-item > span.numbers-item_num', els => els.map(el => el.innerText))

  result.numbers = `${numbers.slice(0, 5).join(',')}|${numbers[5]}|${bonusNum}|${secondDrawNumbers.join(',')}`

  // breakdown
  const tirageLotoData = {
    name: 'Tirage loto',
    detail: []
  }

  const option2ndTirageData = {
    name: 'Option 2nd tirage',
    detail: []
  }
  // const name1 = 'Bons n°'
  // const name2 = 'Grilles gagnantes* Loto®'
  // const name3 = 'Gains par grille gagnantes* Loto®'

  const prizesTable = await page.$('.prizes-table')
  const prizesContentWraper = await prizesTable.$('.tab-content_wrapper')
  const items = await prizesContentWraper.$$('.tab-content')

  const tirageLotoDataTable = await items[0].$('.prizes-table')
  const tirageLotoDataItems = await tirageLotoDataTable.$$('div > div.prizes-table_content')
  tirageLotoDataItems.shift()
  const tirageLotoDataLastItem = tirageLotoDataItems.pop()
  for (const item of tirageLotoDataItems) {
    const tmps = await item.$$('div')
    const tmp1 = await tmps[0].$$eval('span', els => els.map(el => el.innerText).join(''))
    const tmp2 = await tmps[1].evaluate(el => el.innerText)
    const tmp3 = await tmps[2].evaluate(el => el.innerText)
    tirageLotoData.detail.push(
      { name: tmp1, count: parseInt(tmp2.split(' ').join('')), prize: tmp3 }
    )
  }

  const tmps = await tirageLotoDataLastItem.$$('div.prizes-table_item')
  const tmp2 = await tmps[1].evaluate(el => el.innerText)
  const tmp3 = await tmps[2].evaluate(el => el.innerText)
  const tmp1 = await tmps[0].$$('div')
  const tmpName1 = await tmp1[0].$$eval('span', els => els.map(el => el.innerText).join(''))
  const tmpName2 = await tmp1[1].$$eval('span', els => els.map(el => el.innerText).join(''))

  tirageLotoData.detail.push(
    { name: tmpName1, count: parseInt(tmp2.split(' ').join('')), prize: tmp3 }
    // { name: name1, value: tmpName1 },
    // { name: name2, value: tmp2 },
    // { name: name3, value: tmp3 }
  )

  tirageLotoData.detail.push(
    { name: tmpName2, count: parseInt(tmp2.split(' ').join('')), prize: tmp3 }
    // { name: name1, value: tmpName2 },
    // { name: name2, value: tmp2 },
    // { name: name3, value: tmp3 }
  )

  const option2ndDataTable = await items[1].$('.prizes-table')
  const option2ndDataItems = await option2ndDataTable.$$('div > div.prizes-table_content')
  option2ndDataItems.shift()
  for (const item of option2ndDataItems) {
    const tmps = await item.$$('div')
    const tmp1 = await tmps[0].$$eval('span', els => els.map(el => el.innerText).join(''))
    const tmp2 = await tmps[1].evaluate(el => el.innerText)
    const tmp3 = await tmps[2].evaluate(el => el.innerText)
    option2ndTirageData.detail.push(
      { name: tmp1, count: parseInt(tmp2.split(' ').join('')), prize: tmp3 }
      // { name: name1, value: tmp1 },
      // { name: name2, value: tmp2 },
      // { name: name3, value: tmp3 }
    )
  }

  result.breakdown.push(tirageLotoData)
  result.breakdown.push(option2ndTirageData)

  try {
    const other = {
      name: '10 codes gagnants à 20 000€',
      value: null
    }
    const moreWinnersWrapper = await lotoResult.$('.more-winners_wrapper')
    const name = await moreWinnersWrapper.$eval('.drawing-infos_title-wrapper > h2', el => el.innerText)
    // p.s. 这里的 name 的格式是  <+ 10 codes gagnants à 20 000€**> 所以默认使用写死的 other.name
    const value = (await moreWinnersWrapper.$$eval('.more-winners_codes-wrapper > span', els => els.map(el => el.innerText.replace(/ /g, '')))).join('|')

    if (name && value) {
      other.value = value
      result.other.push(other)
    }
  } catch (err) {
    log.error(err)
  }

  const date = moment()
  date.set('years', year)
  date.set('months', month - 1)
  date.set('date', day)
  result.drawTime = date.format('YYYYMMDD203500')

  return result
}

// url 获取
const urlSelector = async function (page) {
  const f = await page.$('#loto-results')
  const urls = await f.$$eval('.btn-content > a', els => els.map(el => el.href))

  if (!urls.length) {
    throw new VError('urls 爬取失败 fr-loto 缺失 urls 为空')
  }

  const noSharp = urls.filter(url => url.indexOf('#') === -1)
  return noSharp[0] || urls[0]
}

async function main () {
  const result = await crawl(data, urlSelector, interpreter)
  return result
}

module.exports = {
  crawl: main
}
