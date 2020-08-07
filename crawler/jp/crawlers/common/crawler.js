/**
 * @Author: maple
 * @Date: 2020-08-05 21:19:37
 * @LastEditors: maple
 * @LastEditTime: 2020-08-07 19:35:48
 */
const VError = require('verror')

const log = require('../../../../util/log')
const urlsGet = require('./urls')
const txtNamesFormat = require('./txt_names_format')
const csvNamesFormat = require('./csv_names_format')
const fileGet = require('./get_file_text')

function getCSVNameById (name, id) {
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
    case 'loto6':
      prefix = 'A102'
      break
    case 'loto7':
      prefix = 'A103'
      break
    case 'miniloto':
      prefix = 'A101'
      break
    default:
      prefix = `unknown_name_${name}`
      break
  }

  return `${prefix}${('0000' + id).slice(-4, 10)}.CSV`
}

/**
 * 爬取彩票实际数据的文本
 * 乐透三个彩票可以通过 name.txt 来获取真实 CSV 名称
 * 而其他彩票没有 name.txt，只能根据 ID 拼接 A10X 来获得 CSV 名称
 * @param {string} name 彩票名称
 * @param {string} mainName 彩票类别
 */
async function crawler (name, mainName, id) {
  // 获得 CSV 文件名
  let lastCsvName
  if (id !== undefined) {
    lastCsvName = getCSVNameById(name, id)
  } else if (mainName === 'bingo' || mainName === 'numbers' || mainName === 'qoochan') {
    const nameURL = urlsGet.getNameCSVURL(name, mainName)

    log.info(`爬取 name csv url: ${nameURL}`)

    const nameText = await fileGet(nameURL)
    const csvNames = csvNamesFormat(nameText)

    lastCsvName = getCSVNameById(name, csvNames[0])
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
  // 获得 CSV 文件的 URL
  // 这里 Numbers3 和 Numbers4 其实是同个文件
  const csvURL = urlsGet.getCSVURL(name, lastCsvName, mainName)

  log.info(`爬取 csv url: ${csvURL}`)

  // 真实文件数据
  const csvText = await fileGet(csvURL)

  return csvText
}

module.exports = crawler
