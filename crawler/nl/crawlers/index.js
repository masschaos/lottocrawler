/* eslint-disable no-console */
/**
 * @Author: maple
 * @Date: 2020-08-24 21:24:59
 * @LastEditors: maple
 * @LastEditTime: 2020-08-25 01:44:50
 */
const VError = require('verror')
const log = require('../../../util/log')
const { newPage, ignoreImage } = require('../../../pptr')
const dateTool = require('./date')

async function crawl (defaultData = {}, { selector, date }, interpreter) {
  let page
  const {
    lotteryID,
    defaultURL
  } = defaultData

  try {
    // new page
    page = await newPage()

    // 忽略图片
    await ignoreImage(page)

    let url = defaultURL

    // 其中 Eurojackpot Lucky Lotto 支持 URL 直接跳转
    if (date) {
      url = `${url}?date=${date}`
    }

    // 打开页面
    await page.goto(url)
    log.info(`nl crawl ${lotteryID} URL: ${url}`)

    // 通过 selector 跳转历史页面 -> Miljoenenspel
    if (selector) {
      await selector(page, date) // 跳转到特定的页面
    }

    // 爬取页面
    const result = await interpreter(page)
    if (!result) {
      throw new VError('result is empty!')
    }
    console.log(JSON.stringify(result, 2, ' '))
    return result
  } catch (err) {
    log.error(err)
    throw new VError(`<${lotteryID}> 没有抓到数据，可能数据源不可用或有更改，请检查调度策略
    detail: ${err.name} - ${err.message}`)
  } finally {
    try {
      await page.close()
    } catch (err) {
      log.error(err)
      // do nothing
    } finally {
      process.exit(1) // test test test test
    }
  }
}

module.exports = crawl

const defaultData = {
  name: 'Eurojackpot',
  lotteryID: 'nl-eurojackpot',
  defaultURL: 'https://eurojackpot.nederlandseloterij.nl/uitslag',
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
  selector: null,
  date: null
}

async function interpreterTbody (body) {
  const trs = await body.$$('tr')
  trs.shift()
  const results = []
  for (const tr of trs) {
    const [td1, td2] = await tr.$$('td')
    const th = await tr.$('th')
    results.push({
      name: await th.evaluate(el => el.innerText),
      prize: await td1.evaluate(el => el.innerText),
      count: parseInt((await td2.$eval('span', el => el.innerText)).replace(' winnaars', '').replace(/\./g, ''))
    })
  }
  return results
}

const interpreter = async function (page) {
  const data = defaultData.initData()
  await page.waitForSelector('.winning-numbers > ul.numberlist > li.numberlist__item')
  // numbers
  const winningNumbers = await page.$('.winning-numbers')
  const lis = await winningNumbers.$$('li.numberlist__item')
  const numbers = []
  for (const li of lis) {
    const spans = await li.$$('span.number-bar__number')
    const items = []
    for (const span of Array.from(spans)) {
      items.push(await span.$eval('span', el => el.innerText))
    }
    numbers.push(items.pop())
  }
  data.numbers = `${numbers.slice(0, 5).join(',')}|${numbers[5]},${numbers[6]}`

  // drawTime
  const selector = await page.$('#draw-select')
  const options = await selector.$$('option')
  let dateText
  for (const option of options) {
    const selected = await option.evaluate(el => el.selected)
    if (selected) {
      dateText = (await option.evaluate(el => el.innerText)).trim()
    }
  }
  data.drawTime = dateTool.formatDate(dateText).format('YYYYMMDD220000')

  // breakdown
  const tablePrize1 = await page.$('tbody#prize-table-0')
  const tablePrize2 = await page.$('tbody#prize-table-1')
  const tablePrize3 = await page.$('tbody#prize-table-2')

  const datas1 = await interpreterTbody(tablePrize1)
  const datas2 = await interpreterTbody(tablePrize2)
  const datas3 = await interpreterTbody(tablePrize3)

  const name1 = 'Jackpot'
  const name2 = 'Hoge prijzen'
  const name3 = 'Overige winnaars'

  data.breakdown = [
    {
      name: name1,
      detail: datas1
    },
    {
      name: name2,
      detail: datas2
    },
    {
      name: name3,
      detail: datas3
    }
  ]
  return data
}

async function main () {
  await crawl(defaultData, selector, interpreter)
}

main()
