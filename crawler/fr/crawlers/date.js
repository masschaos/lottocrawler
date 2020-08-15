const VError = require('verror')

exports.getWeek = function (weekName) {
  switch (weekName.toLowerCase()) {
    case 'lundi':
      return 1
    case 'mardi':
      return 2
    case 'mercredi':
      return 3
    case 'jeudi':
      return 4
    case 'vendredi':
      return 5
    case 'samedi':
      return 6
    case 'dimanche':
      return 7
    default:
      throw new VError('未知的 fr 星期')
  }
}

exports.getMonth = function (month) {
  switch (month.toLowerCase()) {
    case 'janvier':
      return 1
    case 'fevrier':
      return 2
    case 'mars':
      return 3
    case 'avril':
      return 4
    case 'mai':
      return 5
    case 'juin':
      return 6
    case 'juillet':
      return 7
    case 'aout':
      return 8
    case 'septembre':
      return 9
    case 'octobre':
      return 10
    case 'novembre':
      return 11
    case 'decembre':
      return 12
    default:
      throw new VError('未知的 fr 月份')
  }
}
