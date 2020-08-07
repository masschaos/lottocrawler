/**
 * 处理 name.txt 内容，返回 csv 名称数组
 * @Author: maple
 * @Date: 2020-08-05 21:25:28
 * @LastEditors: maple
 * @LastEditTime: 2020-08-06 00:55:44
 */
module.exports = function (text) {
  const lines = text.split('\n')
    .map(line => line.trim().replace(/\t/g, ' '))
    .filter(line => line)
  const results = []

  for (const line of lines) {
    if (line.indexOf('第') === 0) {
      results.push(parseInt(line.slice(1)))
    }
  }

  return results
}
