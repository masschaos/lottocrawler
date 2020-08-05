/**
 * @Author: maple
 * @Date: 2020-08-05 21:37:58
 * @LastEditors: maple
 * @LastEditTime: 2020-08-06 00:59:04
 */
const axios = require('axios')
const VError = require('verror')
const encoding = require('encoding-japanese')

const log = require('../../../../util/log')

async function getFileTextBase (url) {
  const resp = await axios.request({
    url: url,
    method: 'GET',
    responseType: 'arraybuffer'
  })

  const data = resp.data

  if (!data || !data.length) {
    throw new VError('data is empty')
  }

  return data
}

async function getFileText (url) {
  let data
  let retryTimes = 3
  let lastError
  while (retryTimes-- && !data) {
    try {
      // 获得 buffer
      const dataBuffer = await getFileTextBase(url)

      // 转成 utf8
      // 尝试 type 改成 string 之后返回错误的 str
      data = Buffer.from(encoding.convert(dataBuffer, {
        to: 'UTF8',
        from: 'SJIS',
        type: 'arraystrbuffer'
      })).toString()

      console.log()
    } catch (err) {
      lastError = err
      log.warn(`爬虫错误: ${err.messsage || err}`)
    }
  }

  if (!data) {
    if (lastError) {
      throw new VError(lastError, '爬虫失败')
    }

    throw new VError('爬取数据为空')
  }

  return data
}

module.exports = getFileText

// const url = 'https://www.mizuhobank.co.jp/takarakuji/apl/txt/miniloto/name.txt?1596630168578'

// async function main () {
//   console.log(await getFileText(url))
// }

// main()
