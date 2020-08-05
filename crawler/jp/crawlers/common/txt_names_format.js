/**
 * 处理 xxx.csv 包含最新的彩票 ID 的文件
 * lottery ID 需要拼接 A10X 才能作为 CSV 文件名
 * 可靠性很低，但是没办法
 * @Author: maple
 * @Date: 2020-08-05 21:25:28
 * @LastEditors: maple
 * @LastEditTime: 2020-08-06 03:32:21
 */
const log = require('../../../../util/log')

module.exports = function (text) {
  const lines = text.split('\n')
    .map(line => line.trim().replace(/\t/g, ' '))
    .filter(line => line)

  const startText = lines.shift()
  const endText = lines.pop()

  if (startText !== 'FILENAME-START') {
    if (startText.indexOf('NAME') === 0) {
      lines.unshift(startText)
    } else {
      log.warn(`name.txt 起始文件头有变更: ${startText}`)
    }
  }

  if (endText !== 'FILENAME-END') {
    if (endText.indexOf('NAME') === 0) {
      lines.pop(endText)
    } else {
      log.warn(`name.txt 结束文件名变更: ${endText}`)
    }
  }

  const results = [] // csv names

  for (const line of lines) {
    const tmps = line.split(' ').map(t => t.trim()).filter(t => t)

    if (tmps.length < 2 || tmps[0] !== 'NAME') {
      log.warn(`name.txt 错误数据: ${tmps.join(' ')}`)
      continue
    }

    results.push(tmps[1])
  }

  return results
}
