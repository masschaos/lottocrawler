const { newPage } = require('../../pptr')

const MONTH = {
  January: 1,
  February: 2,
  March: 3,
  April: 4,
  May: 5,
  June: 6,
  July: 7,
  August: 8,
  September: 9,
  October: 10,
  November: 11,
  December: 12,
  декабрь: 12,
  ноябрь: 11,
  октябрь: 10,
  сентябрь: 9,
  август: 8,
  июль: 7,
  июнь: 6,
  май: 5,
  апрель: 4,
  март: 3,
  февраль: 2,
  январь: 1
}
const TurnPage = async (url, selector) => {
  const page = await newPage(true)
  const waitfor = selector
  await page.goto(url)
  await page.waitForSelector(waitfor)

  const from = '#content > form > div.search_fields > span.view.date > span > input[name=from]'
  const to = '#content > form > div.search_fields > span.view.date > span > input[name=to]'
  const button = '#content > form > div.search_fields > button'
  const year = '2020'
  const month = '07'
  const day = '01'
  const more = '#content > div.more > span.pseudo'
  // 日.月.年
  const startTime = `${day}.${month}.${year}`
  const endTime = undefined
  // 清空输入框
  await page.$eval(from, input => { input.value = '' })
  if (startTime) { await page.type(from, startTime, { delay: 1000 }) }
  if (endTime) { await page.type(to, endTime, { delay: 1000 }) }
  await page.click(button)
  await page.waitFor(4000)
  for (let i = 0; i < 100; i++) {
    await page.waitFor(4000)
    const result = await page.click(more).catch(err => { if (err) { return -1 } })
    if (result === -1) {
      break
    }
  }
  return page
}
const writeJsonToFile = (lotteryID, TotalData) => {
  const fs = require('fs')
  const filename = `${lotteryID}.json`
  fs.writeFileSync(filename, JSON.stringify(TotalData))
  console.log(`finished save to ${filename}`)
}
module.exports = {
  MONTH,
  TurnPage,
  writeJsonToFile
}
