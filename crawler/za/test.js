async function start () {
  var country = 'za'
  var lotteryIDs = [
    'za-daily-lotto',
    'za-lotto',
    'za-lotto-plus-1',
    'za-lotto-plus-2',
    'za-pick-3',
    'za-powerball',
    'za-powerball-plus'
  ]
  var getCrawler = require('../../crawler/' + country)
  for (var id of lotteryIDs) {
    var crawlers = getCrawler.get(id)
    for (var crawler of crawlers) {
      var res = await crawler.crawl()
      console.log(JSON.stringify(res))
    }
  }
}

start()
