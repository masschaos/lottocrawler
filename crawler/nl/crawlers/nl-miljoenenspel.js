/**
 * @Author: maple
 * @Date: 2020-08-24 21:14:22
 * @LastEditors: maple
 * @LastEditTime: 2020-08-27 04:54:14
 */
const dateTool = require('./date')
const crawler = require('./index')
const VError = require('verror')
const log = require('../../../util/log')

const defaultData = {
  name: 'nl-miljoenenspel',
  lotteryID: 'Miljoenenspel',
  defaultURL: 'https://miljoenenspel.nederlandseloterij.nl/miljoen/trekkingen.html',
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

const selector = {
  selector: async function (page, date) {
    const selector = await page.$('#drawNumberGameId')

    // 拿到所有已有的 options
    const dates = await selector.$$eval('option', els => els.map(el => ({
      text: el.innerText,
      value: el.value
    })))
    const nlDate = dateTool.formatToNlDate(date)
    const result = dates.filter(item => item.text === nlDate)
    if (!result.length) {
      throw new VError(`selector options 不包含 ${nlDate} 的日期`)
    }
    const selectItem = result[0]

    // select
    await selector.select(selectItem.value)
    await page.waitFor(2000)
  },
  date: null
}

const interpreter = async function (page) {
  const data = defaultData.initData()

  // numbers & jackpot
  const blocks = await page.$$('.loCol.lo2-4 > .box2')
  if (blocks.length < 3) {
    throw new VError(`nl crawler ${defaultData.lotteryID} blocks 数据小于 4`)
  }

  if (blocks.length === 4) blocks.pop() // 第四个 block 不需要
  const blockDatas = []

  for (const block of blocks) {
    const title = await block.$eval('h2 > strong', el => el.innerText)
    const header = await block.$('.header')
    const numbers = await header.$$eval('div', els => els.map(el => el.innerText))
    let luckLetter
    try {
      luckLetter = await block.$eval('.luckyletter-hilite > .ball.ball-medium.six.inline', el => el.innerText)
    } catch (err) {
      log.warn(`luckyletter 缺失: ${err.message}`)
    }

    blockDatas.push({
      numbers: `${numbers.join('|')}|${luckLetter || ''}`,
      jackpot: `${title.trim()} euro`
    })
  }

  data.numbers = `${blockDatas[0].numbers}|${blockDatas[1].numbers}|${blockDatas[2].numbers}`
  data.jackpot = [blockDatas[0].jackpot, blockDatas[1].jackpot, blockDatas[2].jackpot]

  // drawTime
  const titleBlock = await page.$('.floatL')
  const dateText = await titleBlock.$eval('strong', el => el.innerText)
  const date = dateTool.formatDate(dateText)
  data.drawTime = date.format('YYYYMMDD213000')
  return data
}

async function main (date) {
  const result = await crawler(defaultData, { ...selector, date }, interpreter)
  return result
}

module.exports = {
  crawl: main
}
