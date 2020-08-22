const VError = require('verror')
const axios = require('axios')
const log = require('../../../util/log')
const baseURL = 'https://www.loteriasyapuestas.es/servicios/buscadorSorteos'
const fs = require('fs')

const encodeSearchParams = (obj) => {
  return Object.keys(obj).map((key) => {
    return [key, encodeURIComponent(obj[key] || '')].join('=')
  }).join('&')
}

const createFile = (fileName, fileContent = '') => {
  /**
     * 根据文件名和文件内容进行文件的创建和内容写入
     * fileName: 文件名
     * fileContent: 文件内容
     */
  // log.debug(fileName, fileContent, "fileContent")
  fs.writeFile(fileName, fileContent, 'utf8', error => {
    if (error) { log.debug(error); return false }
    log.debug(`${fileName}创建成功`)
  })
}

const axioConfig = (url) => {
  return {
    method: 'get',
    url,
    headers: {
      Connection: 'keep-alive',
      Accept: 'application/json, text/javascript, */*; q=0.01',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36',
      'Accept-Language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7'
    }
  }
}
const LotteryConfig = {
  'es-bonoloto': {
    name: 'Bonoloto',
    gameId: 'BONO'
  },
  'es-el-gordo': {
    name: 'El Gordo',
    gameId: 'ELGR'
  },
  'es-euromillions': {
    name: 'Euromillions',
    gameId: 'EMIL'
  },
  'es-la-primitiva': {
    name: 'La Primitiva',
    gameId: 'LAPR'
  }
}

const lastestQueryTime = () => {
  const date = new Date()
  const endTime = date.toISOString().split('T')[0].replace(/-/g, '')
  date.setMonth(date.getMonth() - 3)
  const startTime = date.toISOString().split('T')[0].replace(/-/g, '')
  return [startTime, endTime]
}
const getDrawIssuesByAPI = async (lotteryID, startDate, endDate) => {
  const config = LotteryConfig[lotteryID]
  const queryObj = {
    game_id: config.gameId,
    celebrados: true,
    fechaInicioInclusiva: startDate,
    fechaFinInclusiva: endDate
  }
  const finalUrl = `${baseURL}?${encodeSearchParams(queryObj)}`
  try {
    const response = await axios(axioConfig(finalUrl))
    const result = response.data
    if (result || result.length > 0) {
      return result
    } else {
      throw new VError('获取api数据失败')
    }
  } catch (err) {
    throw new VError(err)
  }
}

const getBaseData = async (lotteryID, startTime, endTime, isLatest) => {
  let data = await getDrawIssuesByAPI(lotteryID, startTime, endTime)
  const config = LotteryConfig[lotteryID]
  if (isLatest) {
    data = data.slice(0, 1)
  }
  // log.debug(JSON.stringify(data, null, 2), 'data')
  const totalData = []
  // log.debug(JSON.stringify(data), 'getData')
  for (const latestData of data) {
    const resultData = {}
    const detailData = latestData.escrutinio
    const [year, day] = latestData.fecha_sorteo.split(' ')
    resultData.drawTime = `${year.split('-').join('')}${day.split(':')[0]}0000`
    resultData.numbers = latestData.combinacion
    resultData.name = config.name
    resultData.lotteryID = lotteryID
    resultData.issue = ''
    resultData.jackpot = [`${latestData.premio_bote} €`]

    if (latestData.joker) {
      resultData.joker = latestData.joker.combinacion
      resultData.jokerbreakdown = {
        name: 'joker',
        detail: latestData.escrutinio_joker.map(item => {
          return { name: item.tipo, prize: `${item.premio} €` }
        })
      }
    }

    if (latestData.millon) {
      resultData.millon = latestData.millon.combinacion
      resultData.millonbreakdown = {
        name: 'millon',
        detail: latestData.escrutinio_millon.map(item => {
          return { name: item.tipo, prize: `${item.premio} €` }
        })
      }
    }
    resultData.breakdown = [{
      name: 'main',
      detail: detailData.map(item => {
        const detail = { name: item.tipo.replace(/ {6}/g, ''), count: parseInt(item.ganadores), prize: `${item.premio} €` }
        if (item.ganadores_eu) {
          detail.europeWinner = item.ganadores_eu
        }
        return detail
      })
    }]
    // APIkey: PageValue
    const otherDict = {
      premio_bote: ['Bote ofrecido', 'Jackpot offered'],
      apuestas: ['Apuestas recibidas', 'Bets received'],
      recaudacion: ['Recaudación', 'Collected'],
      premios: ['Premios', 'Prizes']
    }
    resultData.other = Object.keys(otherDict).map(item => {
      return { name: otherDict[item][0], value: latestData[item] || '0', nameEn: otherDict[item][1] }
    })
    // 每个彩种需要手动处理numbers,drawTime
    totalData.push(resultData)
  }
  return totalData
}
const crawLatest = async (parse, lotteryID) => {
  const [startTime, endTime] = lastestQueryTime()
  let latestDraw = await getBaseData(lotteryID, startTime, endTime, true)
  latestDraw = latestDraw[0]
  return parse(latestDraw)
}

async function crawlHistory (parse, path, lotteryID) {
  const startTime = '20000101'
  let endTime = '20200729'
  let latestDraws = await getBaseData(lotteryID, startTime, endTime, false)
  const result = []
  log.debug(startTime, endTime)
  try {
    while (latestDraws[latestDraws.length - 1].drawTime.slice(0, 8) < endTime) {
      for (const latestDraw of latestDraws) {
        const res = parse(latestDraw)
        // log.debug(res, 'res')
        result.push(res)
      }
      endTime = latestDraws[latestDraws.length - 1].drawTime.slice(0, 8)
      latestDraws = await getBaseData(lotteryID, startTime, endTime, false)
      log.debug(startTime, endTime)
    }
  } catch (err) {
    log.debug(err)
  } finally {
    const results = deduplicationSort(result)
    createFile(path, JSON.stringify(results))
  }
}

const compare = (property) => {
  return function (obj1, obj2) {
    var value1 = obj1[property]
    var value2 = obj2[property]
    return parseInt(value1) - parseInt(value2)
  }
}

const deduplicationSort = (result) => {
  const tmp = new Set()
  const res = []
  for (const data of result) {
    if (!tmp.has(data.drawTime)) {
      res.push(data)
      tmp.add(data.drawTime)
    }
  }
  return res.sort(compare('drawTime'))
}
module.exports = {
  getBaseData,
  lastestQueryTime,
  createFile,
  crawlHistory,
  crawLatest
}
