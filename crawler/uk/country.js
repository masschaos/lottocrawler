const log = require('../../util/log')

const MONTH = {
  January: 1,
  February: 2,
  March: 3,
  April: 4,
  May: 5,
  June: 6,
  July: 7,
  August: 8,
  September: 9,
  October: 10,
  November: 11,
  December: 12,
  декабрь: 12,
  ноябрь: 11,
  октябрь: 10,
  сентябрь: 9,
  август: 8,
  июль: 7,
  июнь: 6,
  май: 5,
  апрель: 4,
  март: 3,
  февраль: 2,
  январь: 1,
  Jan: 1,
  Feb: 2,
  Mar: 3,
  Apr: 4,
  Jun: 6,
  Jul: 7,
  Aug: 8,
  Sept: 9,
  Oct: 10,
  Nov: 11,
  Dec: 12
}

const MonthOrDayProcess = (numberString) => {
  const number = parseInt(numberString).toString()
  return number.length < 2 ? '0' + number : number
}

const monthCheck = (numberString) => {
  return ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].indexOf(numberString) !== -1
}

const dayCheck = (numberString) => {
  return ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10',
    '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
    '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'].indexOf(numberString) !== -1
}

const writeJsonToFile = (lotteryID, jsonData) => {
  const fs = require('fs')
  const filename = `${lotteryID}.json`
  fs.writeFileSync(filename, JSON.stringify(jsonData))
  log.debug(`create success ${filename}`)
}

module.exports = {
  MONTH,
  MonthOrDayProcess,
  monthCheck,
  dayCheck,
  writeJsonToFile
}
