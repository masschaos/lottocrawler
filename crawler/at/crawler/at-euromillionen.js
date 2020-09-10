/**
 * @Author: maple
 * @Date: 2020-09-06 10:12:39
 * @LastEditors: maple
 * @LastEditTime: 2020-09-07 21:12:58
 */
const crawler = require('./index')
const { DrawingError } = require('../../../util/error')
const moment = require('moment')
const VError = require('verror')

// 默认数据
const defaultData = {
  name: 'EuroMillionen',
  lotteryID: 'at-euromillionen',
  defaultURL: 'https://www.win2day.at/lotterie/euromillionen/euromillionen-ziehungen',
  initData: function () {
    return {
      drawTime: null,
      numbers: null,
      jackpot: [],
      breakdown: [],
      other: [],
      name: this.name,
      lotteryID: this.lotteryID,
      issue: ''
    }
  }
}

// 选择器
const selector = {
  selector: null,
  date: null
}

// page 解析器
const interpreter = async function (page) {
  const originData = await page.evaluate(() => {
    const data = {}
    const winningNumbers = document.querySelector('.win-numbers')
    const numBlocks = winningNumbers.querySelectorAll('strong.num')
    const nums = []
    for (const block of numBlocks) {
      nums.push(block.innerText)
    }

    data.nums = nums

    const accordionCol = document.querySelector('.accordion-col-link')
    const tmps = accordionCol.querySelectorAll('p')
    const quittungsnummer = tmps[0].innerText
    const gewinn = tmps[1].innerText

    data.quittungsnummer = quittungsnummer
    data.gewin = gewinn

    const fakeTable = document.querySelector('.fake-table')
    const fakeTrs = fakeTable.querySelectorAll('.fake-tr')

    // breakdownDatas
    // [ {left: "8-mal 5 Zahlen + 0 Sterne", mid: "zu je", right: "€ 20.649,10"}... ]
    const breakdownDatas = []
    for (const tr of fakeTrs) {
      if (!tr.hasChildNodes()) {
        throw new Error('at child nodes is empty')
      }
      const leftTd = tr.children[0]
      const midTd = tr.children[1]
      const rightTd = tr.children[2]

      breakdownDatas.push({
        left: leftTd.hasChildNodes() ? leftTd.children[0].innerText : null,
        mid: midTd.hasChildNodes() ? midTd.innerText : null,
        right: rightTd.hasChildNodes() ? rightTd.children[0].innerText : null
      })
    }
    data.breakdownDatas = breakdownDatas

    // date
    const dateBlock = document.querySelector('h5.accordion-header')
    data.dateText = dateBlock.innerText
    return data
  })

  // numbers
  const result = defaultData.initData()
  const lottoNumber = originData.nums.slice(0, 5).join(',')
  const starNumber = originData.nums.slice(5, 7).join(',')
  const bonusNumber = originData.quittungsnummer.split(' ').join('')
  if (isNaN(parseInt(bonusNumber))) {
    throw new DrawingError()
  }
  result.numbers = `${lottoNumber}|${starNumber}|${bonusNumber}`

  // jockpot
  const [, jackpot] = originData.gewin.split(':').map(m => m.trim())
  if (!jackpot || jackpot.indexOf('€') !== 0) {
    throw new DrawingError()
  }
  result.jackpot.push(jackpot)

  // drawTime
  const [, timeText] = originData.dateText.split(',').map(m => m.trim())
  const drawTime = moment(timeText, 'DD.MM.YYYY').format('YYYYMMDD222500')
  result.drawTime = drawTime

  // breakdown
  const breakdown = {
    name: 'main',
    detail: [

    ]
  }
  if (originData.breakdownDatas.length > 1) {
    // 如果 breakdown 数据缺失
    // 就可以通过分步的方式获取数据
    for (let i = 1; i < originData.breakdownDatas.length; i++) {
      const { left, right } = originData.breakdownDatas[i]
      const _texts = left.split(' ')
      // eslint-disable-next-line no-useless-escape
      const count = parseInt(_texts.shift().replace(/\.|-mal/g, ''))

      if (isNaN(count)) {
        throw new VError(`at crawler id: ${defaultData.lotteryID} count error`)
      }

      breakdown.detail.push({
        name: _texts.join(' '),
        prize: right,
        count: count
      })
    }
    result.breakdown.push(breakdown)

    // other
    const otherData = originData.breakdownDatas[0]
    const other = {
      name: otherData.left,
      value: otherData.right
    }
    result.other.push(other)
  }
  return result
}

async function main (step) {
  const result = await crawler(defaultData, selector, interpreter)
  return result
}
module.exports = {
  crawl: main
}

// main()
//   .then(function (data) {
//     console.log(data)
//     require('fs').writeFileSync(`${defaultData.lotteryID}.json`, JSON.stringify(data, 2, ' '))
//   })
//   .catch(function (err) {
//     console.error(err)
//   })
