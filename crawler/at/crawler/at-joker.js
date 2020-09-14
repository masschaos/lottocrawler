const crawler = require('./index')
const moment = require('moment')

// 默认数据
const defaultData = {
  name: 'Joker',
  lotteryID: 'at-joker',
  defaultURL: 'https://www.win2day.at/lotterie/joker/joker-ziehungen',
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
    const section = document.querySelector('#draw-result-joker')
    const drawNumbers = section.querySelector('.win-numbers')
      .querySelector('.draw-numbers')

    const spans = drawNumbers.querySelectorAll('span')
    const nums = []
    for (const span of spans) {
      nums.push(span.innerText)
    }
    data.nums = nums

    const fakeTable = section.querySelector('.fake-table')
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
    const dateBlock = section.querySelector('h5.accordion-header')
    data.dateText = dateBlock.innerText
    return data
  })
  const result = defaultData.initData()

  // numbers
  result.numbers = `${originData.nums.join('|')}`

  // drawTime
  const [, timeText] = originData.dateText.split(',').map(m => m.trim())
  const drawTime = moment(timeText, 'DD.MM.YYYY').format('YYYYMMDD184000')
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
    for (let i = 0; i < originData.breakdownDatas.length; i++) {
      const { left, right } = originData.breakdownDatas[i]
      const countStr = left // countStr
      let count = parseInt(left.replace(/\./g, ''))

      // 两种可能性
      // 1. 111-mal
      // 2. 2 Joker
      if (isNaN(count)) {
        count = 0
      }

      breakdown.detail.push({
        name: (i + 1).toString(),
        prize: right,
        count: count,
        countStr: countStr
      })
    }
    result.breakdown.push(breakdown)
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
