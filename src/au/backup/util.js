function dateFormatter (drawTime) {
  /**
     * @param 'Saturday 27 June 2020'
     * @return yyyymmddHHMMSS
     */
  const drawTimeArray = drawTime.split(' ').slice(1)
  const monthMap = {
    January: '01',
    February: '02',
    March: '03',
    April: '04',
    May: '05',
    June: '06',
    July: '07',
    August: '08',
    September: '09',
    October: '10',
    November: '11',
    December: '12'
  }
  const month = monthMap[drawTimeArray[1]]
  return [drawTimeArray[2], month, drawTimeArray[0].padStart(2, '0'), '000000'].join('')
}

module.exports = {
  dateFormatter
}
