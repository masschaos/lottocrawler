/**
 * 用于转换荷兰特有的日期格式
 * @Author: maple
 * @Date: 2020-08-24 21:15:09
 * @LastEditors: maple
 * @LastEditTime: 2020-08-27 05:41:20
 */
const VError = require('verror')
const moment = require('moment')

/**
 * 根据 drawTime 获取若干天前的 YYYY-MM-DD 格式日期
 * 一般是七天
 * lucky day 是 1 天
 * @param {object} param0 { date, momentObj, drawTime }
 * @param {*} days 间隔时间，如果寻找之前的日期，必须传入负数
 */
exports.getLastDate = function ({ date, momentObj, drawTime }, days) {
  let todayDate = momentObj
  if (date && date.trim()) {
    try {
      if (!todayDate) {
        todayDate = moment()
      }
      const [year, month, day] = date.trim().split('-')
      todayDate.set('years', parseInt(year))
      todayDate.set('months', parseInt(month) - 1)
      todayDate.set('date', parseInt(day))
    } catch (err) {
      throw new VError(`荷兰日期格式化处理错误 err: ${err.message}: date: ${date || 'moment 对象'}`)
    }
  } else if (drawTime) {
    try {
      todayDate = moment(drawTime, 'YYYYMMDDHHmmss')
    } catch (err) {
      throw new VError(`荷兰日期格式化处理错误 err: ${err.message}: drawTime: ${drawTime || 'moment 对象'}`)
    }
  }

  if (!isNaN(parseInt(days))) {
    todayDate.add(days, 'days')
  }

  return todayDate.format('YYYY-MM-DD')
}

// 将荷兰特有的日期格式化出 Moment 对象
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

// 将 YYYY-MM-DD 格式化成荷兰日期
// 并且月份是缩写
// 用于 Miljoenenspel 的日期选择器
exports.formatToNlDate = function (str) {
  const [year, monthStr, day] = str.split('-')
  let month
  switch (parseInt(monthStr)) {
    case 1:
      month = 'januari'
      break
    case 2:
      month = 'februari'
      break
    case 3:
      month = 'maart'
      break
    case 4:
      month = 'april'
      break
    case 5:
      month = 'mei'
      break
    case 6:
      month = 'juni'
      break
    case 7:
      month = 'juli'
      break
    case 8:
      month = 'augustus'
      break
    case 9:
      month = 'september'
      break
    case 10:
      month = 'oktober'
      break
    case 11:
      month = 'november'
      break
    case 12:
      month = 'december'
      break

    default:
      throw new VError(`转换成荷兰月份信息错误 date: ${str}`)
  }

  // massrt 三月的缩写是 mrt
  return `${day} ${month === 'maart' ? 'mrt' : month.slice(0, 3)} ${year}`
}
