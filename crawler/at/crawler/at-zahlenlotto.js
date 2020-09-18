/**
 * @Author: maple
 * @Date: 2020-09-06 21:49:23
 * @LastEditors: maple
 * @LastEditTime: 2020-09-18 23:06:20
 */
const crawler = require('./index')
const moment = require('moment')

// 默认数据
const defaultData = {
  name: 'Zahlenlotto',
  lotteryID: 'at-zahlenlotto',
  defaultURL: 'https://www.win2day.at/lotterie/zahlenlotto',
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
  await page.waitForSelector('#draw-result-zahlenlotto-1')
  const originData = await page.evaluate(() => {
    const data = {}
    const section = document.querySelector('#draw-result-zahlenlotto-1')
    const drawNumbers = section.querySelector('.win-numbers')
      .querySelector('.draw-numbers')

    const spans = drawNumbers.querySelectorAll('span')
    const nums = []
    for (const span of spans) {
      nums.push(span.innerText)
    }
    data.nums = nums

    // date
    const dateBlock = section.querySelector('.accordion-header-is-parent')
    data.dateText = dateBlock.innerText
    return data
  })

  // init data
  const result = defaultData.initData()

  // numbers
  const numbers = originData.nums.join(',')
  result.numbers = `${numbers}`

  // drawTime
  const [, timeText] = originData.dateText.split(',').map(m => m.trim())
  const drawTime = moment(timeText, 'DD.MM.YYYY').format('YYYYMMDD000000')
  result.drawTime = drawTime
  return result
}

async function main (step) {
  const result = await crawler(defaultData, selector, interpreter, step)
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
