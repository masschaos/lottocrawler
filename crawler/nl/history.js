/**
 * @Author: maple
 * @Date: 2020-08-27 03:31:20
 * @LastEditors: maple
 * @LastEditTime: 2020-08-27 05:48:09
 */
const crawlers = require('./index')
const dateTools = require('./crawlers/date')
const log = require('../../util/log')
const VError = require('verror')
const fs = require('fs')
const util = require('util')
const path = require('path')

const writeFile = util.promisify(fs.writeFile)

/**
 * 存储数据到 JSON 文件
 * @param {string} name 名称
 * @param {id} id id
 * @param {object}} data 数据
 */
async function saveData (name, data) {
  const filePath = path.join(__dirname, 'history', `${name}.JSON`)
  await writeFile(filePath, JSON.stringify(data))
}

async function done () {
  const resultInfos = []
  for (const [name, datas] of crawlers) {
    log.info(`history crawler: ${name}`)
    const crawler = datas[0].crawl
    const lastData = await crawler()
    const results = [lastData]
    let count = 1 // 总期数
    let lastDrawTime = lastData.drawTime // 最后一个数据的 drawTime，因为没有 issue ，通过日期增减的方式来获得上一期
    let repeatTimes = 0 // 重复次数，防止反复爬取同一期的数据
    try {
      // 期数 > 100
      // OR
      // 重复次数大于 3 次
      while (count < 101 && repeatTimes < 3) {
        try {
          // 获得上一期的时间
          // lucky day 是每天一次，其他 lotto 是一周固定星期一次
          const preDate = dateTools.getLastDate({ drawTime: lastDrawTime }, name === 'nl-lucky-day' ? -1 : -7)

          // nl-miljoenenspel 2020-05-30 这期是空的
          // 这里特殊处理直接跳到下一期
          if (name === 'nl-miljoenenspel' && preDate === '2020-05-30') {
            lastDrawTime = '20200530000000' // 直接跳到上一期
            continue
          }

          // crawl data
          const nextData = await crawler(preDate)

          // 判断爬取是否重复
          if (results[results.length - 1].drawTime === nextData.drawTime) {
            log.warn('爬取数据重复')
            log.warn(nextData)
            repeatTimes++ // 考虑到多次重复直接结束
            // 可能是用 select 选择器刷新时间超时，再试一次
            continue
          }

          // 如果爬取不重复，置空 repatTimes
          repeatTimes = 0

          // 正常数据的处理数据
          count++ // 数量 + 1
          lastDrawTime = nextData.drawTime // 替换 last drawtime
          log.info(lastDrawTime)
          results.push(nextData)
        } catch (err) {
          throw new VError(err, `nl crawler history: ${name} error`)
        }
      }
    } catch (err) {
      log.warn(err)
    }
    // 展示最后爬取的结果
    const info = `\n${name} 爬取结束!
    爬取开始日期: ${lastData.drawTime}
    爬取结束日期: ${lastDrawTime}
    数据数量一共: ${results.length}
    最后重复次数: ${repeatTimes}`
    resultInfos.push(info)
    log.info(info)

    await saveData(name, results)
  }

  for (const info of resultInfos) {
    log.info(info)
  }
}

done()
// crawlers.get('nl-miljoenenspel')[0].crawl('2020-05-30')
