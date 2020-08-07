/**
 * @Author: maple
 * @Date: 2020-08-07 13:52:04
 * @LastEditors: maple
 * @LastEditTime: 2020-08-07 14:20:12
 */
const VError = require('verror')
const moment = require('moment')

function deal (line) {
  const issue = parseInt(line.slice(1, 5)).toString()
  const tmps = line.split(',')

  let ReiwaYear
  let month
  let day

  for (const t of tmps) {
    if (t.indexOf('令和') === 0) {
      const yearAt = t.indexOf('年')
      const monthAt = t.indexOf('月')
      const dayAt = t.indexOf('日')

      if (!yearAt || !monthAt || !dayAt) {
        continue
      }
      ReiwaYear = parseInt(t.slice(2, yearAt))
      month = parseInt(t.slice(yearAt + 1, monthAt))
      day = parseInt(t.slice(monthAt + 1, dayAt))
    }
  }

  if (!ReiwaYear || !month || !day) {
    throw new VError('爬取开奖时间错误')
  }

  const year = ReiwaYear + 2018
  const date = moment()
  date.set('years', year)
  date.set('months', month - 1)
  date.set('date', day)
  return {
    drawTime: date.format('YYYYMMDD184500'),
    issue
  }
}
module.exports = deal
