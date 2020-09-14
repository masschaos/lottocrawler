const moment = require('moment')
const log = require('../../util/log')
const fs = require('fs')
const path = require('path')
const Crawler = require('./crawler')
const { sleep } = require('../../util/time')
const lotteryList = [
  {
    other: [],
    name: 'Gana Diario',
    lotteryID: 'pe-gana-diario',
    issue: '',
    indexPagePath: '/peru/ganadiario.php',
    time: '183500',
    openDayList: [0, 1, 2, 3, 4, 5, 6]
  }, {
    other: [],
    name: 'Kabala',
    lotteryID: 'pe-kabala',
    issue: '',
    indexPagePath: '/peru/kabala.php',
    time: '165000',
    openDayList: [2, 4, 6]
  }, {
    other: [],
    name: 'Tinka',
    lotteryID: 'pe-tinka',
    issue: '',
    indexPagePath: '/peru/tinka.php',
    time: '165000',
    openDayList: [0, 3, 6]
  }]

const crawl = async (config, filename) => {
  let crawl = Crawler.createCrawler(config)
  const results = []
  try {
    let result = await crawl.crawl()
    delete result.openDayList
    results.push(result)
    log.info(result)
    const lastTime = moment(result.drawTime, 'YYYYMMDD')
    let queryTime = lastTime
    let queryTimeFormat = queryTime.format('YYYY-MM-DD')
    while (results.length < 100 && queryTimeFormat >= '2020-01-01') {
      try {
        queryTime = queryTime.subtract(1, 'days')
        queryTimeFormat = queryTime.format('YYYY-MM-DD')
        const weekday = queryTime.weekday()
        if (config.openDayList.indexOf(weekday) !== -1) {
          config.indexPagePath = config.indexPagePath.split('?')[0] + `?del-dia=${queryTimeFormat}`
          crawl = Crawler.createCrawler(config)
          sleep(3000)
          result = await crawl.crawl()
          delete result.openDayList
          results.push(result)
        }
      } catch (err) {
        log.info(err)
      }
    }
  } catch (err) {
    log.info(err, 'err')
  } finally {
    createFile(filename, JSON.stringify(results))
  }

  return results
}

function mkdirs (dir) {
  // 创建文件夹
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }
}
const createFile = (fileName, fileContent = '') => {
  fs.writeFile(fileName, fileContent, 'utf8', error => {
    if (error) { log.info(error); return false }
    log.info(`${fileName}创建成功`)
  })
}
async function main () {
  const historyPath = path.dirname(require.main.filename)
  const historyDataPath = path.join(historyPath, './history/')
  mkdirs(historyDataPath)
  for (const config of lotteryList) {
    const filename = path.join(historyDataPath, `${config.lotteryID}.json`)
    await crawl(config, filename)
  }
}
main()
