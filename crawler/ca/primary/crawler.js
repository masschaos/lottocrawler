const { newPage } = require('../../../pptr')
const moment = require('moment-timezone')
const fs = require('fs')
const VError = require('verror')
const { DrawingError } = require('../../../util/error')
const { checkDrawResult } = require('../../common')

class Crawler {
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

  async crawl (lotteryID, url, parseFunction, targetDrawTime) {
    const page = await newPage()
    page.setRequestInterception(true)
    page.on('request', request => {
      if (['image', 'script', 'stylesheet'].includes(request.resourceType())) {
        request.abort()
      } else {
        request.continue()
      }
    })
    let result = null
    await page.exposeFunction('drawingError', lotteryID => { throw new DrawingError(lotteryID) })
    await page.exposeFunction('vError', text => { throw new VError(text) })
    try {
      await page.goto(url)
      result = await parseFunction(page, targetDrawTime)
    } catch (err) {
      throw VError(err, '加拿大爬虫出错')
    } finally {
      await page.close()
    }
    checkDrawResult(lotteryID, result)
    return result
  }

  async saveData (item, saveFilePath) {
    if (saveFilePath) {
      const writeStream = fs.createWriteStream(saveFilePath, { encoding: 'utf-8', flags: 'a' })
      writeStream.write(item + '\n')
      writeStream.close()
    }
  }
}

module.exports = Crawler
