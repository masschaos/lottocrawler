
const axios = require('axios').default
const moment = require('moment')
const log = require('../../util/log')
const time = require('../../util/time')
const cheerio = require('cheerio')
const LORO_BASE = 'https://jeux.loro.ch/games'
const SWISSLOS_BASE = 'https://www.swisslos.ch/de'
const NAME_DE_MAP = {
  'Ordre exact': 'Genaue Reihenfolge',
  'Tous les ordres': 'Alle Reihenfolgen',
  Milieu: 'Mitte',
  '1er Chiffre': '1. Ziffer'
}

function parseDrawDataMargic (config, response) {
  const $ = cheerio.load(response.data)
  const drawResults = $('.ltr-draw-result')
  const datas = []
  drawResults.each((index, drawResultElement) => {
    const drawData = {
      drawTime: null,
      numbers: null,
      jackpot: [],
      breakdown: [{
        name: config.name,
        detail: []
      }],
      other: [],
      name: config.name,
      lotteryID: config.lotteryID,
      issue: ''
    }
    const $drawResultElement = $(drawResultElement)
    const breakdownNodes = $drawResultElement.find('.ltr-prize-breakdown-table tbody tr')
    const drawTimeNode = $drawResultElement.find('#result-date')
    const drawTime = moment(drawTimeNode.text(), 'dddd D MMMM YYYY', 'fr')
    if (drawTime.isValid()) {
      drawData.drawTime = drawTime.format('YYYYMMDD000000')
    }
    const drawNumberNodes = $drawResultElement.find('.ltr-winning-numbers li')
    const numbers = []
    drawNumberNodes.each((index, drawNumberElement) => {
      numbers.push($(drawNumberElement).text().trim())
    })
    drawData.numbers = numbers.join('|')
    breakdownNodes.each((index, breakdownElement) => {
      const breadownItem = {
        name: $(breakdownElement).find('td:nth-child(1)').text(),
        prize: $(breakdownElement).find('td:nth-child(2)').text()
      }
      if (NAME_DE_MAP[breadownItem.name]) {
        breadownItem.nameDe = NAME_DE_MAP[breadownItem.name]
      }
      drawData.breakdown[0].detail.push(breadownItem)
    })
    datas.push(drawData)
  })
  return datas
}

function parseDrawDataBanco (config, response) {
  const $ = cheerio.load(response.data)
  const drawResults = $('.ltr-draw-result')
  const datas = []
  drawResults.each((index, drawResultElement) => {
    const drawData = {
      drawTime: null,
      numbers: null,
      jackpot: [],
      breakdown: [],
      other: [],
      name: config.name,
      lotteryID: config.lotteryID,
      issue: ''
    }
    const $drawResultElement = $(drawResultElement)
    const drawTimeNode = $drawResultElement.find('.ltr-draw-result-main-game p strong')
    const drawTime = moment(drawTimeNode.text(), 'dddd D MMMM YYYY', 'fr')
    if (drawTime.isValid()) {
      drawData.drawTime = drawTime.format('YYYYMMDD063000')
    }
    const drawNumberNodes = $drawResultElement.find('.ltr-winning-numbers li')
    const numbers = []
    drawNumberNodes.each((index, drawNumberElement) => {
      numbers.push($(drawNumberElement).text().trim())
    })
    drawData.numbers = numbers.join(',')
    datas.push(drawData)
  })
  return datas
}

function parseBreakdown ($, $elements) {
  const breakdowns = []
  $elements.each((index, element) => {
    const breakdownItem = {}
    breakdownItem.name = $(element).find('td:nth-child(1)').text().trim()
    breakdownItem.count = parseNumber($(element).find('td:nth-child(2)').text().trim())
    breakdownItem.prize = `CHF ${$(element).find('td:nth-child(3)').text().trim()}`
    breakdowns.push(breakdownItem)
  })
  return breakdowns
}

function parseTextArray ($, $elements) {
  return $elements.map((index, element) => {
    return $(element).text().trim()
  }).get()
}

function parseDrawDataLotto (config, response) {
  const $ = cheerio.load(response.data)
  const $lotto = $('.game-instructions .quotes__game')
  const $joker = $('.game-instructions .quotes__extra-game')
  const drawData = {
    drawTime: null,
    numbers: null,
    jackpot: [],
    nextDrawTime: null,
    nextJackpot: [],
    breakdown: [
      {
        name: 'lotto',
        detail: []
      },
      {
        name: 'joker',
        detail: []
      }
    ],
    other: [],
    name: config.name,
    lotteryID: config.lotteryID,
    issue: ''
  }
  const currentDate = moment($('.js-datepicker-input').val(), 'DD.MM.YYYY')
  const nextDrawDate = getNextDrawDate(currentDate, [3, 6])
  drawData.drawTime = currentDate.format('YYYYMMDD190000')
  drawData.nextDrawTime = nextDrawDate.format('YYYYMMDD190000')
  drawData.nextJackpot = parseTextArray($, $('.quotes__game-jackpot-value'))
  const numbers = parseTextArray($, $lotto.find('.actual-numbers__number___normal'))
  const specNumbers = []
  specNumbers.push($lotto.find('.actual-numbers__number___lucky').text().trim())
  specNumbers.push($lotto.find('.actual-numbers__number___replay').text().trim())
  const jokerNumbers = $joker.find('.actual-numbers__extra-game___number').text().trim()
  drawData.numbers = `${numbers.join(',')}|${specNumbers.join('|')}|${jokerNumbers}`
  drawData.breakdown[0].detail = parseBreakdown($, $('.game-instructions .quotes__game-table tbody tr'))
  drawData.breakdown[1].detail = parseBreakdown($, $('.game-instructions .quotes__extra-game-table tbody tr'))
  return [drawData]
}

function parseDrawDataEuromillions (config, response) {
  const $ = cheerio.load(response.data)
  const $euroMillions = $('.game-instructions .quotes__game').eq(0)
  const $chance2 = $('.game-instructions .quotes__game').eq(1)
  const $superStar = $('.game-instructions .quotes__extra-game')
  const drawData = {
    drawTime: null,
    numbers: null,
    jackpot: [],
    nextJackpot: [],
    breakdown: [
      {
        name: 'EuroMillions',
        detail: []
      }, {
        name: '2 Chance',
        detail: []
      }, {
        name: 'Super-Star',
        detail: []
      }
    ],
    other: [],
    name: 'EuroMillions',
    lotteryID: 'ch-euromillions',
    issue: ''
  }
  const currentDate = moment($('.js-datepicker-input').val(), 'DD.MM.YYYY')
  const nextDrawDate = getNextDrawDate(currentDate, [2, 5])
  drawData.drawTime = currentDate.format('YYYYMMDD193000')
  drawData.nextDrawTime = nextDrawDate.format('YYYYMMDD193000')
  drawData.nextJackpot = parseTextArray($, $('.quotes__game-jackpot-value'))
  const numbers = parseTextArray($, $euroMillions.find('.actual-numbers__number___normal'))
  const specNumbers = parseTextArray($, $euroMillions.find('.actual-numbers__number___superstar'))
  const chance2Numbers = parseTextArray($, $chance2.find('.actual-numbers__number___normal'))
  const superStarNumbers = parseTextArray($, $superStar.find('.actual-numbers__number___superstar'))
  drawData.numbers = `${numbers.join(',')}|${specNumbers.join(',')}|${chance2Numbers.join(',')}|${superStarNumbers.join('')}`
  drawData.breakdown[0].detail = parseBreakdown($, $('.game-instructions .quotes__game-table tbody tr'))
  drawData.breakdown[1].detail = parseBreakdown($, $('.game-instructions .quotes__extra-game-table').eq(0).find('tbody tr'))
  drawData.breakdown[2].detail = parseBreakdown($, $('.game-instructions .quotes__extra-game-table').eq(1).find('tbody tr'))
  return [drawData]
}

async function queryLoroDrawResult (config, pageNo) {
  const url = `${LORO_BASE}/${config.gameId}/results?pageState=${pageNo}&toDraw=${config.templateId}`
  const response = await axios.get(url)
  let datas = null
  if (response.status === 200) {
    switch (config.gameId) {
      case 'magic3':
      case 'magic4': {
        datas = parseDrawDataMargic(config, response)
        break
      }
      case 'banco': {
        datas = parseDrawDataBanco(config, response)
        break
      }
    }
  }
  return {
    response,
    datas
  }
}

async function querySwisslosDrawResult (config, currentDate) {
  const url = `${SWISSLOS_BASE}/${config.gameId}/information/gewinnzahlen/gewinnzahlen-quoten.html`
  let response = null
  if (currentDate) {
    const formData = [
      `filterDate=${currentDate.format('DD.MM.YYYY')}`,
      `formattedFilterDate=${currentDate.locale('de').format('dd, DD.MM.YYYY')}`,
      `currentDate=${currentDate.format('DD.MM.YYYY')}`
    ]
    response = await axios.post(url, formData.join('&'))
  } else {
    response = await axios.get(url)
  }

  let datas = null
  if (response.status === 200) {
    switch (config.gameId) {
      case 'swisslotto': {
        datas = parseDrawDataLotto(config, response)
        break
      }
      case 'euromillions': {
        datas = parseDrawDataEuromillions(config, response)
        break
      }
    }
  }
  return {
    response,
    datas
  }
}

function getLastDrawDate (currentDate, weeks) {
  const now = moment(currentDate)
  now.subtract(1, 'days')
  while (true) {
    if (weeks.includes(now.isoWeekday())) {
      break
    } else {
      now.subtract(1, 'days')
    }
  }
  return now
}

function getNextDrawDate (currentDate, weeks) {
  const now = moment(currentDate)
  now.add(1, 'days')
  while (true) {
    if (weeks.includes(now.isoWeekday())) {
      break
    } else {
      now.add(1, 'days')
    }
  }
  return now
}

function parseNumber (text) {
  return parseInt(text.replace(/[^0-9]/ig, ''))
}

async function getDrawGamePastDrawResults (config) {
  try {
    let crawlerResult = null
    switch (config.gameId) {
      case 'banco':
      case 'magic3':
      case 'magic4': {
        const pageNo = 1
        crawlerResult = await queryLoroDrawResult(config, pageNo)
        break
      }
      case 'swisslotto':
      case 'euromillions': {
        crawlerResult = await querySwisslosDrawResult(config, null)
        break
      }
    }
    if (crawlerResult.response.status === 200) {
      return {
        error: null,
        data: crawlerResult.datas[0]
      }
    } else {
      return {
        error: `response.status ${crawlerResult.response.status}`,
        data: null
      }
    }
  } catch (error) {
    return {
      error: `${error}`,
      data: null
    }
  }
}
async function getLoroHistoryDrawResults (config) {
  let result = []
  try {
    let pageNo = 1
    while (true) {
      const { response, datas } = await queryLoroDrawResult(config, pageNo)
      if (response.status === 200) {
        result = result.concat(datas)
        log.info(`${config.lotteryID}|${pageNo}|${result.length}|success`)
      }
      if (result.length >= 100) {
        return {
          error: null,
          data: result
        }
      }
      await time.wait(5000)
      pageNo++
    }
  } catch (error) {
    return {
      error: `${error}`,
      data: []
    }
  }
}
async function getDrawGameHistoryDrawResults (config) {
  switch (config.gameId) {
    case 'banco':
    case 'magic3':
    case 'magic4': {
      const result = await getLoroHistoryDrawResults(config)
      return result
    }
    case 'swisslotto':
    case 'euromillions': {
      const result = await getEuroMillionsHistoryDrawResults(config)
      return result
    }
  }
}

async function getEuroMillionsHistoryDrawResults (config) {
  let result = []
  try {
    let currentDate = null
    while (true) {
      const { response, datas } = await querySwisslosDrawResult(config, currentDate)
      if (response.status === 200) {
        if (currentDate === null && datas[0]) {
          currentDate = moment(datas[0].drawTime, 'YYYYMMDDHHmmss')
        }
        result = result.concat(datas)
        log.info(`${config.lotteryID}|${currentDate.format('YYYY-MM-DD')}|${result.length}|success`)
        switch (config.gameId) {
          case 'swisslotto' : {
            currentDate = getLastDrawDate(currentDate, [3, 6])
            break
          }
          case 'euromillions' : {
            currentDate = getLastDrawDate(currentDate, [2, 5])
            break
          }
        }
      }
      if (result.length >= 100) {
        return {
          error: null,
          data: result
        }
      }
      await time.wait(5000)
    }
  } catch (error) {
    return {
      error: `${error}`,
      data: []
    }
  }
}

async function retry (func, retryCount) {
  let count = 0
  while (true) {
    const result = await func()
    if (result.error) {
      await time.wait(5000)
    } else {
      return result
    }
    count++
    if (count >= retryCount) {
      return result
    }
  }
}
module.exports = {
  getDrawGamePastDrawResults,
  getDrawGameHistoryDrawResults,
  retry
}
