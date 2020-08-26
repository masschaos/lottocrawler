/**
 * @Author: maple
 * @Date: 2020-08-26 22:19:33
 * @LastEditors: maple
 * @LastEditTime: 2020-08-27 05:43:08
 */

const dateTool = require('./date')
const crawler = require('./index')

// 日期选择器
const selector = {
  selector: null,
  date: null
}

// 默认数据
const defaultData = {
  name: 'Lucky Day',
  lotteryID: 'nl-lucky-day',
  defaultURL: 'https://luckyday.nederlandseloterij.nl/uitslag',
  initData: function () {
    return {
      drawTime: null,
      numbers: null,
      jackpot: [],
      breakdown: [],
      other: [],
      name: this.name,
      lotteryID: this.lotteryID,
      issue: '',
      winnerCount: null
    }
  }
}

// page 解析器
const interpreter = async function (page) {
  const data = defaultData.initData()

  // numbers
  const results = await page.$('.result-checker__results')
  const numberListEl = await results.$('ul.numberlist')
  const numbers = await numberListEl.$$eval('li', els => els.map(el => el.innerText))
  const bonusEl = await results.$('.numberlist__number--bonus')
  const bonusNumber = await bonusEl.evaluate(el => el.innerText)
  data.numbers = `${numbers.join(',')}|${bonusNumber}`

  const dateText = await results.$eval('.result-checker__date', el => el.innerText)
  data.drawTime = dateTool.formatDate(dateText).format('YYYYMMDD190000')

  const headerH1 = await page.$('h1.heading--shade.heading--sm-margin')
  const winnerText = await headerH1.evaluate(el => el.innerText)
  const winnerCount = winnerText.split(' ').filter(s => !isNaN(parseInt(s)) && parseInt(s) > 1000) // 基于万一有其他数字被格式化成功

  if (winnerCount.length !== 1) {
    throw new Error(`winnerCount 解析数量为: ${winnerCount.length}, data: ${winnerCount.join('|')}`)
  }
  data.winnerCount = parseInt(winnerCount[0])
  return data
}

async function main (date) {
  const result = await crawler(defaultData, { ...selector, date }, interpreter)
  return result
}

module.exports = {
  crawl: main
}
