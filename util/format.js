function moneyFormat (number, decimals, decPoint, thousandsSep, symbol) {
  /*
    * 参数说明：
    * number：要格式化的数字
    * decimals：保留几位小数
    * dec_point：小数点符号
    * thousands_sep：千分位符号
    * symbol: 钱币符号
    * */
  number = (number + '').replace(/[^0-9+-Ee.]/g, '')
  var n = !isFinite(+number) ? 0 : +number
  var prec = !isFinite(+decimals) ? 0 : Math.abs(decimals)
  var sep = (typeof thousandsSep === 'undefined') ? ',' : thousandsSep
  var dec = (typeof decPoint === 'undefined') ? '.' : decPoint
  var s = ''
  var toFixedFix = function (n, prec) {
    var k = Math.pow(10, prec)
    return '' + Math.floor(n * k) / k
  }
  s = (prec ? toFixedFix(n, prec) : '' + Math.floor(n)).split('.')
  var re = /(-?\d+)(\d{3})/
  while (re.test(s[0])) {
    s[0] = s[0].replace(re, '$1' + sep + '$2')
  }

  if ((s[1] || '').length < prec) {
    s[1] = s[1] || ''
    s[1] += new Array(prec - s[1].length + 1).join('0')
  }
  return symbol ? symbol + s.join(dec) : s.join(dec)
}

function dateFormat (drawTime) {
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
  moneyFormat,
  dateFormat
}
