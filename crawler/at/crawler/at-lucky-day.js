/**
 * @Author: maple
 * @Date: 2020-09-06 10:12:39
 * @LastEditors: maple
 * @LastEditTime: 2020-09-15 00:51:05
 */
const crawler = require('./index')
const moment = require('moment')

// 默认数据
const defaultData = {
  name: 'Lucky Day',
  lotteryID: 'at-lucky-day',
  defaultURL: 'https://www.win2day.at/lotterie/luckyday/luckyday-ziehungen',
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
  const originData = await page.evaluate(() => {
    const data = {}
    const lottoResultBlock = document.querySelector('#draw-result-luckyday')
    const winningNumbers = lottoResultBlock.querySelector('.accordion-item.is-open')
    const numBlocks = winningNumbers.querySelectorAll('strong.num')
    const luckSymbol = winningNumbers.querySelector('span.lucky-symbol')
    const nums = []
    for (const block of numBlocks) {
      if (block.innerText !== '-') {
        nums.push(block.innerText)
      }
    }
    // nums.push(luckSymbol.innerText)
    data.nums = nums
    data.symbolClass = luckSymbol.children[0].className

    // date
    const dateBlock = winningNumbers.querySelector('h5.accordion-header-is-parent')
    data.dateText = dateBlock.innerText
    return data
  })
  // init data
  const result = defaultData.initData()

  // numbers
  const numbers = originData.nums.join('|')
  const symbolNumber = originData.symbolClass.split('_').pop()
  result.numbers = `${numbers}|${symbolNumber}`

  // drawTime
  const [, timeText] = originData.dateText.split(',').map(m => m.trim())
  const drawTime = moment(timeText, 'DD.MM.YYYY').format('YYYYMMDD184000')
  result.drawTime = drawTime

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
