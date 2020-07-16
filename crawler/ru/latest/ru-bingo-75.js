// const puppeteer = require('puppeteer')

const url = 'https://en.stoloto.ru/bingo75/archive'
const selector = '#content > div.data.drawings_data'
const selectorAll = '#content > div.data.drawings_data .month'
const detailTotal = '#content > div.col.drawing_results > div > table > tbody > tr'
const detailWaitfor = '#content > div.col.drawing_results > div > table'
const lotteryID = 'ru-bingo-75'
const name = 'Бинго-75'
const { newPage } = require('../../../pptr')
const { MONTH } = require('./country')
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
        const monthyear = element.querySelector('.date').innerText
        let [month, year] = monthyear.split(', ')
        const drawDate = element.querySelector('.draw_date').innerText
        // console.log(drawDate, "drawDate")
        let day = drawDate.split(' ')[0]
        // console.log(day.toString, "day")
        day = day.length < 2 ? '0' + day : day
        // console.log(day, "day")
        month = MONTH[month].toString().length < 2 ? '0' + MONTH[month] : MONTH[month]
        // 对drawDate做处理。
        data.drawTime = `${year}${month}${day}000000`
        data.issue = element.querySelector('.draw').innerText
        data.drawUrl = element.querySelector('.draw a').href
        data.other = []
        data.jackpot = []
        //   console.log(element.querySelector('.numbers_wrapper').outerHTML)
        let numbers = element.querySelector('.numbers_wrapper').innerText
        numbers = numbers.split(' ').join(',')
        data.numbers = numbers
        //   console.log(element.querySelector('.prize').outerHTML)
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
        //   console.log(elementList[0].outerHTML, 'elementList')
        data.level = elementList[0].textContent
        let number = elementList[1].textContent.split('\n').join(',').split('\t').join('')
        //   console.log(number, 'number')
        if (number[0] === ',') {
          number = number.slice(1, number.length)
        }
        if (number[number.length - 1] === ',') {
          number = number.slice(0, number.length - 1)
        }
        if (number === 'Кубышка') {
          data.level = '-1'
          number = ''
        }
        data.number = number
        //   data.winner = elementList[2].textContent
        //   console.log(elementList[3].textContent)
        data.prize = elementList[3].textContent.replace('\n', '').split('\t').join('').replace('\n', '')
        return data
      }
      const results = [...document.querySelectorAll(selector)]
      const dataList = results.map(mapFunction)
      return dataList
    }, selector)
    // page.close()
    return Crawdetail
  } catch (error) {
    throw new VError(error, '爬虫发生预期外错误')
  } finally {
    await page.close()
  }
}

const crawl = async () => {
  const mainData = await Craw(url, selectorAll)
  //   console.log(mainData, 'mainData')
  const detail = await CrawDetail(mainData.drawUrl, detailTotal).then(data => { return data })
  const numbers = [mainData.numbers, ...detail.map(item => item.number)].join('#')
  const details = [{ level: '0', prize: mainData.super_prize, number: mainData.numbers }, ...detail.map(item => { return { level: item.level, prize: item.prize, number: item.number } })]
  const newData = { ...mainData, numbers, detail: details, lotteryID, name }
  delete newData.drawUrl
  delete newData.super_prize
  // console.log(newData, 'result Data')
  return newData
}

module.exports = {
  crawl
}
