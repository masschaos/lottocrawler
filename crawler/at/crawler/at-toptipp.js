/**
 * @Author: maple
 * @Date: 2020-09-06 10:12:39
 * @LastEditors: maple
 * @LastEditTime: 2020-09-09 00:05:27
 */
const crawler = require('./index')
const moment = require('moment')

// 默认数据
const defaultData = {
  name: 'TopTipp',
  lotteryID: 'at-toptipp',
  defaultURL: 'https://www.win2day.at/lotterie/toptipp',
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
    const section = document.querySelector('section.double-teaser')
    const drawNumbers = section.querySelector('.win-numbers.is-active')
      .querySelector('.draw-numbers')

    const spans = drawNumbers.querySelectorAll('span')
    const nums = []
    for (const span of spans) {
      nums.push(span.innerText)
    }
    data.nums = nums

    // date
    const dateBlock = section.querySelector('span.select2-selection__rendered')
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
  const drawTime = moment(timeText, 'DD.MM.YYYY').format('YYYYMMDD180000')
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
