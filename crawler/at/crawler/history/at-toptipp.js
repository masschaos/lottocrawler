/**
 * @Author: maple
 * @Date: 2020-09-06 21:49:23
 * @LastEditors: maple
 * @LastEditTime: 2020-09-18 03:01:08
 */
const crawler = require('../index')
const moment = require('moment')
const { writeHistory } = require('.')

// 默认数据
const defaultData = {
  name: 'TopTipp',
  lotteryID: 'at-toptipp',
  defaultURL: 'https://www.win2day.at/lotterie/toptipp/toptipp-ziehungen',
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
  await page.waitForSelector('h5.accordion-header-is-parent')
  const originDatas = await page.evaluate(() => {
    const sections = document.querySelectorAll('.accordion-item')

    const datas = []
    for (const section of sections) {
      const data = {}
      const drawNumbers = section.querySelector('.win-numbers')
        .querySelector('.draw-numbers')

      const spans = drawNumbers.querySelectorAll('span')
      const nums = []
      for (const span of spans) {
        nums.push(span.innerText)
      }
      data.nums = nums

      // date
      const dateBlock = section.querySelector('h5.accordion-header-is-parent')
      data.dateText = dateBlock.innerText
      datas.push(data)
    }

    return datas
  })

  const results = []

  for (const originData of originDatas) {
    // init data
    const result = defaultData.initData()

    // numbers
    const numbers = originData.nums.join(',')
    result.numbers = `${numbers}`

    // drawTime
    const [, timeText] = originData.dateText.split(',').map(m => m.trim())
    const drawTime = moment(timeText, 'DD.MM.YYYY').format('YYYYMMDD180000')
    result.drawTime = drawTime

    results.push(result)
  }

  return results
}

async function main (step) {
  const result = await crawler(defaultData, selector, interpreter)
  await writeHistory('at-toptipp', result)
}

// main()

module.exports = main
