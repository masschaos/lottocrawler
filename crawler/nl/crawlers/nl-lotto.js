/**
 * @Author: maple
 * @Date: 2020-08-24 21:14:22
 * @LastEditors: maple
 * @LastEditTime: 2020-08-24 23:03:36
 */
const dateTool = require('./date')
const crawler = require('./index')

const defaultData = {
  name: 'Lotto',
  lotteryID: 'nl-lotto',
  defaultURL: 'https://lotto.nederlandseloterij.nl/trekkingsuitslag',
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

const selector = {
  selector: null,
  date: null
}

const interpreter = async function (page) {
  const data = defaultData.initData()

  // numbers
  const drawResultsTable = await page.$('.draw-results-table-cell')
  const drawReusltsList = await drawResultsTable.$$('.draw-results-row > ul.draw-result')
  const funcs = drawReusltsList.map(async drawReuslt =>
    await drawReuslt.$$eval('li > div > span', els => els.map(el => el.innerText)))
  const numbers1 = await funcs[0]
  const numbers2 = await funcs[1]

  data.numbers = `${numbers1.slice(0, 6).join(',')}#${numbers1[6]}|${numbers2.slice(0, 6).join(',')}#${numbers2[6]}`

  const contentTitle = await page.$('.content-title')
  const titleText = await contentTitle.evaluate(el => el.innerText)
  const winnerText = await contentTitle.$eval('span', el => el.innerText)
  const dateText = titleText.slice(24, 0 - winnerText.length)
  const winnerCount = winnerText.split(' ').filter(s => !isNaN(parseInt(s)) && parseInt(s) > 10000) // 基于万一有其他数字被格式化成功

  if (winnerCount.length !== 1) {
    throw new Error(`winnerCount 解析数量为: ${winnerCount.length}, data: ${winnerCount.join('|')}`)
  }
  data.winnerCount = parseInt(winnerCount[0])
  data.drawTime = dateTool.formatDate(dateText).format('YYYYMMDD210000')
  return data
}

async function main (date) {
  const result = await crawler(defaultData, { ...selector, date }, interpreter)
  return result
}

module.exports = {
  crawl: main
}
