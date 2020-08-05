const { newPage } = require('../../../pptr')
const { ignoreUrls } = require('../primary/common')
const { DrawingError } = require('../../../util/error')
const VError = require('verror')
const moment = require('moment')

const lotteryName = 'GlücksSpirale'
const lotteryID = 'de-glucks-spirale'
const url = 'https://www.lotterypost.com/game/330/results'

const getBreakdown = async (page, numberList) => {
  const firstLineSelector = '#prizeTable > table > tbody > tr:nth-child(1) > td:nth-child(1)'
  await page.waitForFunction(
    firstLineSelector => document.querySelector(firstLineSelector).innerText.trim().length > 0,
    {},
    firstLineSelector
  )
  const prizeTrSelector = '#prizeTable > table > tbody > tr'
  let detail = await page.$$eval(prizeTrSelector, trElements => trElements.map(trElement => {
    const tds = Array.from(trElement.querySelectorAll('td'))
    if (tds.length < 3) {
      // 无权限
      return null
    }
    return {
      name: tds[0].innerText,
      prize: tds[1].innerText.replace('Rolling Jackpot', ''),
      odds: tds[2].innerText
    }
  }))
  if (detail.length === 0) {
    throw new DrawingError(lotteryID)
  }
  if (detail[0] === null) {
    return null
  }
  detail = detail.map((item, index) => {
    item.numbers = numberList[index]
    return item
  })
  return [{
    name: 'prizes-odds',
    detail: detail
  }]
}

const crawl = async () => {
  const results = []
  const mainPage = await newPage()
  const prizePage = await newPage()
  await mainPage.setDefaultNavigationTimeout(0)
  await prizePage.setDefaultNavigationTimeout(0)
  let firstLineDrawDate = ''
  try {
    await ignoreUrls(mainPage)
    await ignoreUrls(prizePage)
    await mainPage.goto(url)
    while (true) {
      const firstLineDrawDateSelector = '#resultsTable > table > tbody > tr:nth-child(1) > td > div > div.resultsDrawDate'
      await mainPage.waitForSelector(firstLineDrawDateSelector)
      await mainPage.waitForFunction(
        (firstLineDrawDateSelector, firstLineDrawDate) => document.querySelector(firstLineDrawDateSelector).innerText.trim() !== firstLineDrawDate,
        {},
        firstLineDrawDateSelector, firstLineDrawDate
      )
      const drawRowSelector = '#resultsTable > table > tbody > tr'
      const drawElements = await mainPage.$$eval(drawRowSelector, (elements) => elements.map(trElement => {
        // drawTime
        const drawTiemSelector = 'div.resultsDrawDate'
        const drawTimeString = trElement.querySelector(drawTiemSelector).innerText

        // numbers
        const numberSelector = 'div.resultsRow.resultsPlain'
        let numbers = trElement.querySelector(numberSelector).innerText
        let numberList = numbers.split(',')
        numberList = numberList.map((numberItem, index) => {
          const items = numberItem.split(':')[1].trim().split('/')
          const numbers = []
          for (const item of items) {
            const number = item.padStart(index + 1, '0').padStart(7, '-')
            numbers.push(number)
          }
          return numbers.join('#')
        })
        numbers = numberList[6]

        // breakdown url
        const prizeUrlSelector = 'div.drawWrap > div.resultsLinks > a:nth-child(1)'
        const prizeUrl = trElement.querySelector(prizeUrlSelector).href

        return {
          drawTime: drawTimeString,
          numbers: numbers,
          breakdownUrl: prizeUrl,
          numberList: numberList
        }
      }))
      firstLineDrawDate = drawElements[0].drawTime
      for (const drawElement of drawElements) {
        await prizePage.goto(drawElement.breakdownUrl)
        const breakdown = await getBreakdown(prizePage, drawElement.numberList)
        if (breakdown === null) {
          continue
        }
        drawElement.breakdown = breakdown
        drawElement.jackpot = []
        drawElement.lotteryID = lotteryID
        drawElement.name = lotteryName
        drawElement.drawTime = moment.parseZone(new Date(drawElement.drawTime)).format('YYYYMMDDHHmmss')
        drawElement.nextDrawtime = ''
        drawElement.nextJackpot = []
        delete drawElement.breakdownUrl
        delete drawElement.numberList
        results.push(drawElement)
      }
      const preNextSelector = 'a[title^="Next page"]'
      const nextPageElement = await mainPage.$(preNextSelector)
      if (nextPageElement === null) {
        break
      }
      await nextPageElement.click()
    }
    return results
  } catch (err) {
    if (err.name === 'DrawingError') {
      throw err
    }
    throw new VError(`${lotteryID}没有抓到数据，可能数据源不可用或有更改，请检查调度策略。detail: ${err.name} - ${err.message}`)
  } finally {
    await mainPage.close()
    await prizePage.close()
  }
}
module.exports = { crawl }
