// iEokFo
const log = require('../../../util/log')

const url = 'https://www.stoloto.ru/spec/archive'
const name = 'Специгра'
const lotteryID = 'ru-spec'
const { newPage } = require('../../../pptr')
const { DrawingError } = require('../../../util/error')
const { /* MONTH, TurnPage, */ writeJsonToFile } = require('../country')

async function autoScroll (page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      var totalHeight = 0
      var distance = 300
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight
        log.debug(scrollHeight, totalHeight)
        window.scrollBy(0, distance)
        totalHeight += distance
        if (totalHeight >= scrollHeight) {
          clearInterval(timer)
          resolve()
        }
      }, 1000)
    })
  })
}

const crawl = async () => {
  const page = await newPage()
  let totalResult = []
  try {
    // await ignoreImage(page)  这个不能注释，否则会导致数据缺失。
    await page.goto(url)
    await autoScroll(page)

    const total = '#view > div.sc-164upou-0.jvvtPC > section > div > div.sc-1vywien-0.kJKQdT > ul'
    await page.waitForSelector(total)

    totalResult = await page.$$eval(total + ' .sc-104bj9l-1', elements => elements.map((element) => {
      return {
        time: element.querySelector('.c8n92j-0 a') && element.querySelector('.c8n92j-0 a').textContent,
        url: element.querySelector('.c8n92j-0 a') && element.querySelector('.c8n92j-0 a').href,
        number: element.querySelector('.sc-14hts4f-0') && element.querySelector('.sc-14hts4f-0').textContent
      }
    }).filter((item) => item.time != null))

    const timeProcess = (timeStr) => {
      log.debug(timeStr)
      const [dayString, timeString, , , issueString] = timeStr.split(' ')
      const [day, month, year] = dayString.split('.')
      const [hour, minute] = timeString.split(':')
      const issue = issueString.slice(1)
      const drawTime = `${year}${month}${day}${hour}${minute}00`
      return { issue, drawTime }
    }

    const numberProcess = (numberStr) => {
      if (numberStr.length !== 4) {
        throw new DrawingError(lotteryID)
      }
      const numbers = numberStr.slice(0, -1).split('').join(',') + '|' + numberStr.slice(-1)[0]
      return { numbers }
    }
    // log.debug(totalResult, 'totalResult')
    totalResult = totalResult.map(item => {
      return {
        ...timeProcess(item.time),
        ...numberProcess(item.number),
        url: item.url,
        jackpot: [],
        name,
        lotteryID,
        detail: []
      }
    })

    const base = '#view > div.sc-164upou-0.jvvtPC > section > div > div.'
    const countSelector = 'sc-13vkecg-0.gXUuIR > ul > li:nth-child(2)'
    const rewardSelector = 'sc-13vkecg-0.gXUuIR > ul > li:nth-child(3)'
    const prizeSelector = 'sc-13vkecg-0.gXUuIR > ul > li:nth-child(4)'
    const totalSelector = 'sc-9010k5-0.hKiWSz > ul'

    for (let i = 0; i < totalResult.length; i++) {
      await page.goto(totalResult[i].url)

      await page.waitForSelector('#view > div.sc-164upou-0.jvvtPC > section > div > div.sc-13vkecg-0.gXUuIR')
      const countName = await page.$eval(base + countSelector + ' .sc-1220g8f-2', element => element.textContent)
      const countValue = await page.$eval(base + countSelector + ' .sc-1220g8f-3', element => element.textContent)

      const prizeName = await page.$eval(base + prizeSelector + ' .sc-1220g8f-2', element => element.textContent)
      const prizeValue = await page.$eval(base + prizeSelector + ' .sc-1220g8f-3', element => element.textContent)

      const totalTicketValue = await page.$eval(base + totalSelector + ' .sc-9010k5-2', element => element.textContent)
      const totalTicketName = await page.$eval(base + totalSelector + ' .sc-9010k5-3', element => element.textContent)

      const rewardName = await page.$eval(base + rewardSelector + ' .sc-1220g8f-2', element => element.textContent)
      const rewardValue = await page.$eval(base + rewardSelector + ' .sc-1220g8f-3', element => element.textContent)

      const other = [{ name: countName, value: countValue },
        { name: prizeName, value: prizeValue },
        { name: totalTicketName, value: totalTicketValue },
        { name: rewardName, value: rewardValue }]
      totalResult[i].other = other
      delete totalResult[i].url
    }
    return totalResult
  } catch (err) {
    log.debug(err)
  } finally {
    writeJsonToFile(lotteryID, totalResult)
    await page.close()
  }
}
// (async () => {
//   const result = await crawl()
//   log.debug(result)
// })()
module.exports = {
  crawl
}
