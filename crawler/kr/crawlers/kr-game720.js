const crawl = require('./kr-index')
const moment = require('moment')

const data = {
  name: '연금복권720+',
  lotteryID: 'kr-game720',
  method: 'win720'
}

async function interpreter (page) {
  const result = {
    drawTime: null,
    numbers: null,
    jackpot: [],
    breakdown: [],
    other: [],
    name: data.name,
    lotteryID: data.lotteryID,
    issue: null
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
  result.drawTime = date.format('YYYYMMDD124000')

  const winNumWraps = await winResult.$$('.win_num_wrap')

  let numbers = []

  for (const winNumWrap of winNumWraps) {
    const numsWrap = await winNumWrap.$('.win720_num')
    const winNums = await numsWrap.$$eval('span > span', els => els.map(el => el.innerText))
    numbers = numbers.concat(winNums.slice(1))
    if (!isNaN(parseInt(winNums[0]))) {
      numbers = numbers.concat(winNums[0])
    }
  }

  result.numbers = numbers.join('|')

  // drawTime
  const tbody = await detailResult.$('tbody')
  const trs = await tbody.$$('tr')

  const breakdown = {
    name: '1등 번호기준',
    detail: [

    ]
  }

  for (let i = 0; i < trs.length - 1; i++) {
    const tr = trs[i]
    const datas = await tr.$$eval('td', els => els.map(el => el.innerText))

    if (i === 0) {
      datas.splice(1, 1)
    }

    breakdown.detail.push({
      name: datas[0],
      count: parseInt(datas[4].replace(/,/g, '')),
      prize: datas[3],
      level: datas[2].replace('\n', '')
    })

    if (i === 0 && datas[5]) {
      result.other[0].value = datas[5].split('\n').filter(s => s).join(' ')
    }
  }

  result.breakdown.push(breakdown)

  const last = trs[trs.length - 1]
  const datas = await last.$$eval('td', els => els.map(el => el.innerText))

  result.breakdown.push({
    name: datas[1].replace('\n', ' '),
    detail: [
      {
        name: datas[0],
        count: parseInt(datas[5]),
        prize: datas[4],
        level: datas[3]
      }
    ]
  })

  return result
}

async function main (issue) {
  const result = await crawl(data, data.method, interpreter, issue, true)
  return result
}

module.exports = {
  crawl: main
}
