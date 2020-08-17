/**
 * @Author: maple
 * @Date: 2020-08-16 05:09:59
 * @LastEditors: maple
 * @LastEditTime: 2020-08-16 14:40:41
 */
const crawl = require('./kr-index')
const moment = require('moment')

const data = {
  name: '로또6/45',
  lotteryID: 'kr-letou-645',
  method: 'byWin'
}

async function interpreter (page) {
  const result = {
    drawTime: null,
    numbers: null,
    jackpot: [],
    breakdown: [],
    other: [
      {
        name: '비고',
        value: null
      }
    ],
    name: data.name,
    lotteryID: data.lotteryID,
    issue: null,
    saleAmount: null
  }
  const contentWrap = await page.$('.content_wrap')
  const winResult = await contentWrap.$('.win_result')
  const detailResult = await contentWrap.$('table.tbl_data')

  // issue
  const issue = parseInt(await winResult.$eval('h4 > strong', el => el.innerText))
  result.issue = issue.toString()

  // drawTime
  const dateStr = await winResult.$eval('p.desc', el => el.innerText)
  const tmps = dateStr.slice(1, -1).split(' ')
  const year = parseInt(tmps[0])
  const month = parseInt(tmps[1])
  const day = parseInt(tmps[2])
  const date = moment()
  date.set('years', year)
  date.set('months', month - 1)
  date.set('date', day)
  result.drawTime = date.format('YYYYMMDD204500')

  // number
  const numsWrap = await winResult.$('.nums')
  const winNums = await numsWrap.$$eval('.num.win > p > span', els => els.map(el => el.innerText))
  const bonusNum = await numsWrap.$eval('.num.bonus > p > span', el => el.innerText)
  result.numbers = `${winNums.join(',')}#${bonusNum}`

  // breakdown
  const tbody = await detailResult.$('tbody')
  const trs = await tbody.$$('tr')

  const breakdown = {
    name: 'main',
    detail: [

    ]
  }

  for (let i = 0; i < trs.length; i++) {
    const tr = trs[i]
    const datas = await tr.$$eval('td', els => els.map(el => el.innerText))

    breakdown.detail.push({
      name: datas[0],
      count: parseInt(datas[2].replace(/,/g, '')),
      prize: datas[3],
      totalPrize: datas[1],
      level: datas[4].replace('\n', '')
    })

    if (i === 0 && datas[5]) {
      result.other[0].value = datas[5].split('\n').filter(s => s).join(' ')
    }
  }
  result.breakdown.push(breakdown)

  // saleAmount
  const ul = await contentWrap.$('ul.list_text_common')
  const lis = await ul.$$('li')
  if (lis && lis.length === 2) {
    result.saleAmount = await lis[1].$eval('strong', el => el.innerText)
  }

  return result
}

async function main (issue) {
  const result = await crawl(data, data.method, interpreter, issue)
  return result
}

module.exports = {
  crawl: main
}
