const puppeteer = require('puppeteer')
const { saveLastestResult } = require('../../../util/api')
const moment = require('moment-timezone')
const fs = require('fs')

class crawler {
  dateFormatter (dateString, timeString) {
    if (timeString === undefined) {
      timeString = '000000'
    }
    return moment.parseZone(new Date(dateString)).format('YYYYMMDD') + timeString
  }

  urlParams (targetDrawTime) {
    const current = moment(targetDrawTime.slice(0, 8))
    const startDate = moment(current).subtract(1, 'd')
    const endDate = moment(current).add(1, 'd')
    return '?startDate=' + startDate.format('YYYY-MM-DD') + '&endDate=' + endDate.format('YYYY-MM-DD')
  }

  fillFrName (breakdown, enFrMap) {
    return breakdown.map((item) => {
      item.detail = item.detail.map((v) => {
        if (v.name.indexOf('Bonus') !== -1) {
          v.nameFr = v.name.replace('Bonus', 'Compl.')
        } else if (v.name.indexOf('Early Bird') !== -1) {
          v.nameFr = v.name.replace('Early Bird', 'Mise-Tôt')
        } else if (v.name in enFrMap) {
          v.nameFr = enFrMap[v.name]
        }
        return v
      })
      return item
    })
  }

  async crawl (url, parseFunction, targetDrawTime) {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    page.setRequestInterception(true)
    page.on('request', request => {
      if (['image', 'script', 'stylesheet'].includes(request.resourceType())) {
        request.abort()
      } else {
        request.continue()
      }
    })
    try {
      await page.goto(url)
      const result = await parseFunction(page, targetDrawTime)
      return result
    } catch (error) {
      console.log(error)
      return null
    } finally {
      await browser.close()
    }
  }

  async saveData (item, saveFilePath) {
    if (saveFilePath !== undefined) {
      const writeStream = fs.createWriteStream(saveFilePath, { encoding: 'utf-8', flags: 'a' })
      writeStream.write(item + '\n')
      writeStream.close()
    } else {
      // console.log(item)
      await saveLastestResult(item)
    }
  }
}

module.exports = crawler
