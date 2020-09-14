const crawler = require('./index')
const { DrawingError } = require('../../../util/error')
const moment = require('moment')

// 默认数据
const defaultData = {
  name: 'Loto 6 aus 45',
  lotteryID: 'at-loto-6-aus-45',
  defaultURL: 'https://www.win2day.at/lotterie/lotto',
  lottoPlusURL: 'https://www.win2day.at/lotterie/lottoplus/lottoplus-ziehungen',
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
  },
  initBreakdown: function () {
    return {
      name: 'lotto',
      detail: [

      ]
    }
  },
  initLottoPlusBreakdown: function () {
    return {
      name: 'LottoPlus',
      detail: [

      ]
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
    const lottoResultBlock = document.querySelector('#draw-result-lotto-1')
    const winningNumbers = lottoResultBlock.querySelector('.win-numbers')
    const [numbers, lottoPlus] = winningNumbers.querySelectorAll('.draw-numbers')

    const nums = []
    if (numbers) {
      for (const n of numbers.querySelectorAll('strong')) {
        nums.push(n.innerText)
      }
    }
    if (lottoPlus) {
      for (const n of lottoPlus.querySelectorAll('strong')) {
        nums.push(n.innerText)
      }
    }

    data.nums = nums

    const fakeTable = lottoResultBlock.querySelector('.fake-table')
    const fakeTrs = fakeTable.querySelectorAll('.fake-tr')

    // breakdownDatas
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
    const dateBlock = lottoResultBlock.querySelector('h5.accordion-header')
    data.dateText = dateBlock.innerText
    return data
  })

  // 转至 lottoPlus 页面
  await page.goto(defaultData.lottoPlusURL)

  const originLottoPlusData = await page.evaluate(() => {
    const data = {}
    const lottoResultBlock = document.querySelector('#draw-result-10-lottoplus')

    const fakeTable = lottoResultBlock.querySelector('.fake-table')
    const fakeTrs = fakeTable.querySelectorAll('.fake-tr')

    // breakdownDatas
    const breakdownDatas = []
    for (let i = 0; i < fakeTrs.length; i++) {
      const tr = fakeTrs[i]
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
    return data
  })

  const result = defaultData.initData()

  // numbers
  const nums = originData.nums
  if (nums.length < 10) {
    throw new DrawingError(defaultData.lotteryID)
  }
  const lottoNumber = nums.slice(0, 6).join(',')
  const bonusNumber = nums[7]
  const lottoPlusNumber = nums.slice(8, 15).join(',')
  result.numbers = `${lottoNumber}#${bonusNumber}|${lottoPlusNumber}`

  // drawTime
  const [, timeText] = originData.dateText.split(',').map(m => m.trim())
  const drawTime = moment(timeText, 'DD.MM.YYYY').format('YYYYMMDD191700')
  result.drawTime = drawTime

  // breakdown
  if (originData.breakdownDatas.length > 1) {
    const breakdown = defaultData.initBreakdown()
    // 如果 breakdown 数据缺失
    // 就可以通过分步的方式获取数据
    for (let i = 0; i < originData.breakdownDatas.length; i++) {
      const { left, right } = originData.breakdownDatas[i]
      const _texts = left.split(' ')
      // eslint-disable-next-line no-useless-escape
      let countStr = _texts.shift()
      let count = parseInt(countStr.replace(/\./g, ''))
      let name = _texts.join(' ')
      if (isNaN(count)) {
        countStr = `${countStr} ${name}`
        name = 'Sechser'
        count = 0
      }

      breakdown.detail.push({
        name: name,
        prize: right,
        count: count,
        countStr: countStr
      })
    }
    result.breakdown.push(breakdown)
  }

  if (originLottoPlusData && originLottoPlusData.breakdownDatas && originLottoPlusData.breakdownDatas.length) {
    const breakdown = defaultData.initLottoPlusBreakdown()
    for (let i = 0; i < originLottoPlusData.breakdownDatas.length; i++) {
      const { left, right } = originLottoPlusData.breakdownDatas[i]
      const _texts = left.split(' ')
      let countStr = _texts.shift()
      let count = parseInt(countStr.replace(/\./g, ''))
      let name = _texts.join(' ')
      if (isNaN(count)) {
        countStr = `${countStr} ${name}`
        name = 'Sechser'
        count = 0
      }

      breakdown.detail.push({
        name: name,
        prize: right,
        count: count,
        countStr: countStr
      })
    }
    result.breakdown.push(breakdown)
  }

  // other
  // 1. jocker date
  result.other.push({
    name: 'JokerDrawTime',
    value: moment(timeText, 'DD.MM.YYYY').format('YYYYMMDD191700')
  })

  // breakdownDatas 的第一行数据
  const otherData = originData.breakdownDatas[0]
  const other = {
    name: otherData.left,
    value: otherData.right
  }
  result.other.push(other)

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
