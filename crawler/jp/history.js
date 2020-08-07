/**
 * @Author: maple
 * @Date: 2020-08-07 17:40:43
 * @LastEditors: maple
 * @LastEditTime: 2020-08-07 21:47:40
 */
const fs = require('fs')
const util = require('util')
const path = require('path')

const writeFile = util.promisify(fs.writeFile)
const readFile = util.promisify(fs.readFile)
const mkdir = util.promisify(fs.mkdir)

const log = require('../../util/log')
const crawlers = require('./index')
const VError = require('verror')

const crawlerRanges = {
  'jp-bingo5': ['lasted100', 'lasted'],
  'jp-kisekaeqoochan': ['lasted100', 'lasted'],
  'jp-loto6': ['lasted100', 'lasted'],
  'jp-loto7': ['lasted100', 'lasted'],
  'jp-numbers3': ['lasted100', 'lasted'],
  'jp-numbers4': ['lasted100', 'lasted'],
  'jp-miniloto': ['lasted100', 'lasted']
}

async function saveData (name, id, data) {
  const filePath = path.join(__dirname, 'history/tmp', name, `${id}.JSON`)
  await writeFile(filePath, JSON.stringify(data))
}

async function saveResultData (name, data) {
  const filePath = path.join(__dirname, 'history', `${name}.JSON`)
  await writeFile(filePath, JSON.stringify(data))
}

async function tryGetFile (name, id) {
  const filePath = path.join(__dirname, 'history/tmp', name, `${id}.JSON`)
  try {
    const data = await readFile(filePath, { encoding: 'utf8' })
    return JSON.parse(data)
  } catch (err) {
    return null
  }
}

async function polymerizeData (name, startId, endId) {
  const total = endId - startId + 1
  let tmp = endId
  let success = 0
  let failure = 0

  const datas = []

  while (tmp >= startId) {
    const data = await tryGetFile(name, tmp)
    if (data) {
      datas.push(data)
      success++
    } else {
      failure++
    }

    tmp--
  }

  log.info(`jp 历史数据爬取 LotteryId: ${name} 要求总数: ${total} 成功: ${success} 失败: ${failure}`)

  try {
    await saveResultData(name, datas)
    log.info(`jp 历史数据爬取 LotteryId: ${name} 保存文件成功`)
  } catch (err) {
    log.info(`jp 历史数据爬取 LotteryId: ${name} 保存文件失败`, err)
  }

  console.log(datas.map(data => data.issue))
}

async function mkdirFloder (name) {
  try {
    await mkdir(path.join(__dirname, 'history/tmp', name))
  } catch (err) {
    // do nothing
  }
}

async function done () {
  for (const [name, datas] of crawlers) {
    log.info(`jp 历史数据爬取 Lottery Start id: ${name}`)

    const crawler = datas[0].crawl

    // 0. 初始化文件
    await mkdirFloder(name)

    // 1. 检查爬取范围
    const crawlerRange = crawlerRanges[name]
    let crawlerStart = crawlerRange[0]
    let crawkerEnd = crawlerRange[1]

    if (crawkerEnd === 'lasted') {
      const lastData = await crawler()
      crawkerEnd = lastData.issue
    }

    if (crawlerStart === 'lasted100') {
      crawlerStart = crawkerEnd - 99
    } else if (crawlerStart === 'lasted1') {
      crawlerStart = crawkerEnd - 1
    }

    if (crawlerStart < 1) {
      crawlerStart = 1
    }

    if (crawlerStart > crawkerEnd) {
      crawlerStart = crawkerEnd
    }

    log.info(`jp 历史数据爬取 Lottery id: ${name} 范围: ${crawlerStart} - ${crawkerEnd}`)

    // 2. 开始爬取流程
    for (let i = crawkerEnd; i >= crawlerStart; i--) {
      // 2.1 检查单个信息文件是否已存在
      let data = await tryGetFile(name, i)

      // 文件存在结束本次爬取
      if (data) {
        log.info(`jp 历史数据爬取 LotteryId: ${name} id: ${i} 已存在数据，跳过`)
        // 数据已存在 json 文件中
        continue
      }

      // 2.2 爬取信息
      try {
        data = await crawler(i)
        if (!data) {
          throw new VError('data is empty')
        }
      } catch (err) {
        console.error(err)
        log.error(`jp 历史数据爬取 LotteryId: ${name} id: ${i} 错误: ${err.message}`, err)
      }

      // 2.3 写入到文件
      if (data) {
        await saveData(name, i, data)
      }
    }
    log.info(`jp 历史数据爬取 LotteryId: ${name} 聚合数据 Start`)
    // 3. 聚合文件到一个总 JSON
    await polymerizeData(name, crawlerStart, crawkerEnd)
  }
}

done()
