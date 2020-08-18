const url = 'https://www.stoloto.ru/spec/archive'
const name = 'Специгра'
const lotteryID = 'ru-spec'
const { newPage /*, ignoreImage */ } = require('../../../pptr')
const { DrawingError } = require('../../../util/error')
// iEokFo

const crawl = async () => {
  const page = await newPage()
  try {
    // await ignoreImage(page)  这个不能注释，否则会导致数据缺失。
    await page.goto(url)
    const total = '#view > div.sc-164upou-0.jvvtPC > section > div > div.sc-1vywien-0.kJKQdT > ul > li:nth-child(1)'
    await page.waitForSelector(total)
    const timeStr = await page.$eval(total + ' .sc-104bj9l-3 a', element => { return { time: element.textContent, url: element.href } })
    const [dayString, timeString, , , issueString] = timeStr.time.split(' ')
    const [day, month, year] = dayString.split('.')
    const [hour, minute] = timeString.split(':')
    const issue = issueString.slice(1)
    const drawTime = `${year}${month}${day}${hour}${minute}00`
    const number = await page.$eval(total + ' .kkekyl', element => element.textContent)
    if (number.length !== 4) {
      throw new DrawingError(lotteryID)
    }
    const numbers = number.slice(0, -1).split('').join(',') + '|' + number.slice(-1)[0]
    // console.log(drawTime, prizeStr, numbers, issue, timeStr.url)
    await page.goto(timeStr.url)
    const base = '#view > div.sc-164upou-0.jvvtPC > section > div > div.'
    const countSelector = 'sc-13vkecg-0.gXUuIR > ul > li:nth-child(2)'
    const rewardSelector = 'sc-13vkecg-0.gXUuIR > ul > li:nth-child(3)'
    const prizeSelector = 'sc-13vkecg-0.gXUuIR > ul > li:nth-child(4)'
    const totalSelector = 'sc-9010k5-0.hKiWSz > ul'
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
    return { drawTime, numbers, issue, other, jackpot: [], name, lotteryID, detail: [] }
  } finally {
    await page.close()
  }
}

module.exports = {
  crawl
}
