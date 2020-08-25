/**
 * @Author: maple
 * @Date: 2020-08-24 21:15:09
 * @LastEditors: maple
 * @LastEditTime: 2020-08-24 22:25:08
 */
const VError = require('verror')
const moment = require('moment')

exports.getLastDate = function ({ date, momentObj }, days) {
  let todayDate = momentObj
  if (!todayDate) {
    todayDate = moment()
  }
  if (date.trim()) {
    try {
      const [year, month, day] = date.trim().split('-')
      todayDate.set('years', parseInt(year))
      todayDate.set('months', parseInt(month) - 1)
      todayDate.set('date', parseInt(day))
    } catch (err) {
      throw new VError(`荷兰日期格式化处理错误 err: ${err.message}: date: ${date || 'moment 对象'}`)
    }
  }

  if (!isNaN(parseInt(days))) {
    todayDate.add('days', days)
  }

  return todayDate.format('YYYY-MM-DD')
}

exports.formatDate = function (str) {
  const [day, monthStr, year] = str.split(' ')
  let month
  switch (monthStr) {
    case 'januari':
      month = 1
      break
    case 'februari':
      month = 2
      break
    case 'maart':
      month = 3
      break
    case 'april':
      month = 4
      break
    case 'mei':
      month = 5
      break
    case 'juni':
      month = 6
      break
    case 'juli':
      month = 7
      break
    case 'augustus':
      month = 8
      break
    case 'september':
      month = 9
      break
    case 'oktober':
      month = 10
      break
    case 'november':
      month = 11
      break
    case 'december':
      month = 12
      break

    default:
      throw new VError('荷兰解析月份信息错误')
  }

  const date = moment()
  date.set('years', year)
  date.set('date', day)
  date.set('months', parseInt(month) - 1)
  return date
}
