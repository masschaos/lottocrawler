/**
 * @Author: maple
 * @Date: 2020-09-06 10:13:35
 * @LastEditors: maple
 * @LastEditTime: 2020-09-18 03:52:50
 */
const fs = require('fs')
const path = require('path')
const log = require('../../util/log')

const countryCode = 'at'

const filenames = fs.readdirSync(path.join(__dirname, 'crawler', 'history')).filter(file => file.indexOf(`${countryCode}-`) === 0)

async function main () {
  for (const filename of filenames) {
    const [name] = filename.split('.')
    // if (name === 'at-euromillionen') continue
    // if (name === 'at-joker') continue
    // if (name === 'at-loto-6-aus-45') continue
    // if (name === 'at-lucky-day') continue
    // if (name === 'at-toptipp') continue
    // if (name === 'at-zahlenlotto') continue
    log.info(`crawl history lotteryID: ${name}`)
    const crawler = require(path.join(__dirname, 'crawler', 'history', name))
    await crawler()
  }
}

main()
