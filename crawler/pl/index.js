
const Crawler = require('./latest/crawler')
const crawlers = new Map()
const CRAWLER_CONFIGS = [
  {
    gameId: 'Lotto',
    name: 'Lotto',
    lotteryID: 'pl-lotto',
    drawTime: '215000',
    specialChar: '|',
    noSpecialChar: ',',
    breakdown: {
      Lotto: {
        name: 'Lotto',
        detail: {
          1: 'szóstka',
          2: 'piątka',
          3: 'czwórka',
          4: 'trójka'
        }
      },
      LottoPlus: {
        name: 'Lotto Plus',
        detail: {
          1: 'szóstka',
          2: 'piątka',
          3: 'czwórka',
          4: 'trójka'
        }
      }
    }
  },
  {
    gameId: 'MiniLotto',
    name: 'Mini Lotto',
    lotteryID: 'pl-mini-lotto',
    drawTime: '215000',
    specialChar: '|',
    noSpecialChar: ',',
    breakdown: {
      MiniLotto: {
        name: 'Mini Lotto',
        detail: {
          1: 'piątka',
          2: 'czwórka',
          3: 'trójka'
        }
      }
    }
  },
  {
    gameId: 'Kaskada',
    name: 'Kaskada',
    lotteryID: 'pl-kaskada',
    specialChar: '|',
    noSpecialChar: ',',
    breakdown: {
      Kaskada: {
        name: 'Kaskada',
        detail: {
          1: '12',
          2: '11',
          3: '10',
          4: '9',
          5: '8'
        }
      }
    }
  },
  {
    gameId: 'EkstraPensja',
    name: 'Ekstra Pensja',
    lotteryID: 'pl-ekstra-pensja',
    specialChar: '|',
    noSpecialChar: ',',
    breakdown: {
      EkstraPensja: {
        name: 'Ekstra Pensja',
        detail: {
          1: '5+1',
          2: '5+0',
          3: '4+1',
          4: '4+0',
          5: '3+1',
          6: '3+0',
          7: '2+1',
          8: '2+0'
        }
      },
      EkstraPremia: {
        name: 'Ekstra Premia',
        detail: {
          1: '5+1',
          2: '5+0',
          3: '4+1',
          4: '4+0',
          5: '3+1',
          6: '3+0',
          7: '2+1',
          8: '2+0'
        }
      }
    }
  },
  {
    gameId: 'SuperSzansa',
    name: 'Super Szansa',
    lotteryID: 'pl-super-szansa',
    specialChar: '|',
    noSpecialChar: '',
    breakdown: {
      SuperSzansa: {
        name: 'main',
        detail: {
          1: '1',
          2: '2',
          3: '3',
          4: '4',
          5: '5',
          6: '6',
          7: '7'
        }
      }
    }
  },
  {
    gameId: 'MultiMulti',
    name: 'Multi Multi',
    lotteryID: 'pl-multi-multi',
    specialChar: '|',
    noSpecialChar: ',',
    breakdown: {
      MultiMulti: {
        name: 'main'
      }
    }
  },
  {
    gameId: 'EuroJackpot',
    name: 'Eurojackpot',
    lotteryID: 'pl-eurojackpot',
    specialChar: ',',
    noSpecialChar: ',',
    breakdown: {
      EuroJackpot: {
        name: 'main'
      }
    }
  }
]

for (const config of CRAWLER_CONFIGS) {
  crawlers.set(config.lotteryID,
    [Crawler.createCrawler(config)]
  )
}

module.exports = crawlers
