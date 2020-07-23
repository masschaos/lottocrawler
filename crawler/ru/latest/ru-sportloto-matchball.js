// const puppeteer = require('puppeteer')
const url = 'https://www.stoloto.ru/5x50/archive'
const selector = '#content > div.data.drawings_data'
const selectorAll = '#content > div.data.drawings_data .month'
const detailTotal = '#content > div.col.prizes > div.results_table.with_bottom_shadow > div > table > tbody > tr'
const detailWaitfor = '#content > div.col.prizes > div.results_table.with_bottom_shadow > div > table'
const lotteryID = 'ru-sportloto-matchball'
const name = 'Спортлото Матчбол'

const { newPage } = require('../../../pptr')
const { MONTH } = require('../country')
const VError = require('verror')

const Craw = async (url, selectorAll) => {
  const page = await newPage()
  try {
    const waitfor = selector
    await page.goto(url)
    await page.waitForSelector(waitfor)
    const CrawResult = await page.evaluate((selectorAll, MONTH) => {
      const mapFunction = (element) => {
        const data = {}
        const drawDate = element.querySelector('.draw_date').innerText
        const [yearPro, dayPro] = drawDate.split(' ')
        const time = dayPro.split(':').join('')
        const [day, month, year] = yearPro.split('.')
        data.drawTime = `${year}${month}${day}${time}00`
        data.issue = element.querySelector('.draw').innerText
        data.drawUrl = element.querySelector('.draw a').href
        data.other = []
        data.jackpot = []
        let numbers = element.querySelector('.numbers_wrapper').innerText
        const tmp = numbers.split(' ')
        numbers = [tmp.slice(0, tmp.length - 1).join(','), tmp[tmp.length - 1]].join('|')
        data.numbers = numbers
        data.super_prize = element.querySelector('.prize').innerText
        return data
      }
      const results = document.querySelector(selectorAll)
      // console.log(results)
      const TotalData = mapFunction(results)
      return TotalData
    }, selectorAll, MONTH)
    // page.close()
    return CrawResult
  } catch (error) {
    throw new VError(error, '爬虫出现未预期错误')
  } finally {
    await page.close()
  }
}

const CrawDetail = async (url, selector) => {
  const page = await newPage()
  try {
    await page.goto(url)
    await page.waitForSelector(detailWaitfor)

    const Crawdetail = await page.evaluate((selector) => {
      const mapFunction = (element) => {
        const data = {}
        const elementList = [...element.querySelectorAll('td')]
        data.level = elementList[0].textContent
        data.winners = elementList[4].textContent.replace(/\n/g, '').split('\t').join('')
        return data
      }
      const results = [...document.querySelectorAll(selector)]
      const dataList = results.map(mapFunction)
      return dataList
    }, selector)
    // page.close()
    return Crawdetail
  } catch (error) {
    throw new VError(error, '爬虫出现未预期错误')
  } finally {
    await page.close()
  }
}

const crawl = async () => {
  const mainData = await Craw(url, selectorAll)
  // console.log(mainData, 'mainData')
  const detail = await CrawDetail(mainData.drawUrl, detailTotal).then(data => { return data })
  // console.log(detail, 'detail')
  const numbers = mainData.numbers
  const details = detail.map(item => { return { level: item.level, total_winner: item.winners } })
  const newData = { ...mainData, numbers, detail: details, lotteryID, name, jackpot: [mainData.super_prize] }
  delete newData.drawUrl
  delete newData.super_prize
  console.log(newData, "newData")
  return newData
}
// crawl()
module.exports = {
  crawl
}
