/**
 * @Author: maple
 * @Date: 2020-09-17 20:11:21
 * @LastEditors: maple
 * @LastEditTime: 2020-09-18 01:24:11
 */
const log = require('../../../util/log')

function formatStr (str) {
  if (typeof str !== 'string') {
    log.warn(`str: ${str} got ${typeof str}`)
    return str
  }
  return parseInt(str.replace('-mal', '').replace(/\./g, ''))
}

function formatNumber (num, noTail = false) {
  if (typeof num !== 'number') {
    log.warn(`num: ${num} got ${typeof num}`)
    return num
  }
  const count = num.toString().replace(/\d(?=(\d{3})+\.)/g, '$&.')
  if (noTail) {
    return count
  }
  return `${count}-mal`
}

exports.formatStr = formatStr
exports.formatNumber = formatNumber
