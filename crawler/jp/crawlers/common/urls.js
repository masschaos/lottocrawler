/**
 * 返回各种 URL
 * @Author: maple
 * @Date: 2020-08-05 21:04:02
 * @LastEditors: maple
 * @LastEditTime: 2020-08-06 03:32:31
 */
'use strict'

const moment = require('moment')
const hostname = 'https://www.mizuhobank.co.jp'

exports.getNameTXTURL = function (name) {
  return `${hostname}/takarakuji/apl/txt/${name}/name.txt?${moment().valueOf()}`
}

exports.getNameCSVURL = function (name, mainName) {
  if (mainName === 'numbers') {
    return `${hostname}/retail/takarakuji/numbers/csv/numbers.csv?${moment().valueOf()}`
  }
  if (mainName === 'qoochan') {
    return `${hostname}/retail/takarakuji/${name}/${mainName}/csv/${name}.csv?${moment().valueOf()}`
  }
  return `${hostname}/retail/takarakuji/${mainName}/${name}/csv/${name}.csv?${moment().valueOf()}`
}

exports.getCSVURL = function (name, csvName, mainName) {
  if (mainName === 'qoochan') {
    return `${hostname}/retail/takarakuji/${name}/${mainName}/csv/${csvName}?${moment().valueOf()}`
  }
  if (mainName === 'numbers') {
    return `${hostname}/retail/takarakuji/numbers/csv/${csvName}?${moment().valueOf()}`
  }
  return `${hostname}/retail/takarakuji/${mainName}/${name}/csv/${csvName}?${moment().valueOf()}`
}
