/**
 * @Author: maple
 * @Date: 2020-08-05 21:19:37
 * @LastEditors: maple
 * @LastEditTime: 2020-08-07 18:49:21
 */
const VError = require('verror')

const log = require('../../../../util/log')
const urlsGet = require('./urls')
const txtNamesFormat = require('./txt_names_format')
const csvNamesFormat = require('./csv_names_format')
const fileGet = require('./get_file_text')

/**
 * 爬取彩票实际数据的文本
 * 乐透三个彩票可以通过 name.txt 来获取真实 CSV 名称
 * 而其他彩票没有 name.txt，只能根据 ID 拼接 A10X 来获得 CSV 名称
 * @param {string} name 彩票名称
 * @param {string} mainName 彩票类别
 */
async function crawler (name, mainName) {
  // 获得 CSV 文件名
  let lastCsvName
  if (mainName === 'bingo' || mainName === 'numbers' || mainName === 'qoochan') {
    const nameURL = urlsGet.getNameCSVURL(name, mainName)

    log.debug(`爬取 name csv url: ${nameURL}`)

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

    log.debug(`爬取 name url: ${nameURL}`)

    const nameText = await fileGet(nameURL)
    const csvNames = txtNamesFormat(nameText)
    lastCsvName = csvNames[0]
  }

  if (!lastCsvName) {
    throw new VError('爬取 csv 目录失败')
  }
  // 获得 CSV 文件的 URL
  // 这里 Numbers3 和 Numbers4 其实是同个文件
  const csvURL = urlsGet.getCSVURL(name, lastCsvName, mainName)

  log.debug(`爬取 csv url: ${csvURL}`)

  // 真实文件数据
  const csvText = await fileGet(csvURL)

  return csvText
}

module.exports = crawler
