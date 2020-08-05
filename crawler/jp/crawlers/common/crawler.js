/**
 * @Author: maple
 * @Date: 2020-08-05 21:19:37
 * @LastEditors: maple
 * @LastEditTime: 2020-08-06 02:07:26
 */
const VError = require('verror')

const log = require('../../../../util/log')
const urlsGet = require('./urls')
const txtNamesFormat = require('./txt_names_format')
const csvNamesFormat = require('./csv_names_format')
const fileGet = require('./get_file_text')

async function crawler (name, mainName) {
  let lastCsvName
  if (mainName === 'bingo' || mainName === 'numbers' || mainName === 'qoochan') {
    const nameURL = urlsGet.getNameCSVURL(name, mainName)

    log.info(`爬取 name csv url: ${nameURL}`)

    const nameText = await fileGet(nameURL)
    const csvNames = csvNamesFormat(nameText)

    let prefix
    switch (name) {
      case 'bingo5':
        prefix = 'A104'
        break
      case 'numbers3':
        prefix = 'A100'
        break
      case 'numbers4':
        prefix = 'A100'
        break
      case 'kisekae-qoochan':
        prefix = 'A105'
        break
      default:
        break
    }

    lastCsvName = `${prefix}${('0000' + csvNames[0]).slice(-4, 10)}.CSV`
  } else {
    const nameURL = urlsGet.getNameTXTURL(name)

    log.info(`爬取 name url: ${nameURL}`)

    const nameText = await fileGet(nameURL)
    const csvNames = txtNamesFormat(nameText)
    lastCsvName = csvNames[0]
  }

  if (!lastCsvName) {
    throw new VError('爬取 csv 目录失败')
  }

  const csvURL = urlsGet.getCSVURL(name, lastCsvName, mainName)

  log.info(`爬取 csv url: ${csvURL}`)

  const csvText = await fileGet(csvURL)

  return csvText
}

module.exports = crawler
