/**
 * @Author: maple
 * @Date: 2020-08-30 09:05:16
 * @LastEditors: maple
 * @LastEditTime: 2020-08-30 15:55:03
 */
const Crawler = require('./index')
const VError = require('verror')
// const log = require('../../../util/log')
const moment = require('moment')

class BrLotomania extends Crawler {
  constructor () {
    const config = {
      lotteryId: 'br-mega-sena'
    }
    super(config)

    this.url = 'http://loterias.caixa.gov.br/wps/portal/loterias/landing/lotomania/!ut/p/a1/04_Sj9CPykssy0xPLMnMz0vMAfGjzOLNDH0MPAzcDbz8vTxNDRy9_Y2NQ13CDA38jYEKIoEKnN0dPUzMfQwMDEwsjAw8XZw8XMwtfQ0MPM2I02-AAzgaENIfrh-FqsQ9wBmoxN_FydLAGAgNTKEK8DkRrACPGwpyQyMMMj0VAajYsZo!/dl5/d5/L2dBISEvZ0FBIS9nQSEh/pw/Z7_61L0H0G0JGJVA0AKLR5T3K00V0/res/id=buscaResultado/c=cacheLevelPage/=/'
  }

  render (data) {
    const keys = {
      0: 'qtGanhadoresFaixa1',
      1: 'qtGanhadoresFaixa2',
      2: 'qtGanhadoresFaixa3',
      3: 'qtGanhadoresFaixa4',
      4: 'qtGanhadoresFaixa5',
      5: 'qtGanhadoresFaixa7',
      6: 'qtGanhadoresFaixa6',
      7: {
        key: 'vrRateioFaixa1',
        render: value => value === 0 ? 'Acumulado' : `R$${this.formatMoney(value)}`
      },
      8: {
        key: 'vrRateioFaixa2',
        render: value => value === 0 ? 'Acumulado' : `R$${this.formatMoney(value)}`
      },
      9: {
        key: 'vrRateioFaixa3',
        render: value => this.formatMoney(value)
      },
      10: {
        key: 'vrRateioFaixa4',
        render: value => this.formatMoney(value)
      },
      11: {
        key: 'vrRateioFaixa5',
        render: value => this.formatMoney(value)
      },
      12: {
        key: 'vrRateioFaixa7',
        render: value => this.formatMoney(value)
      },
      13: {
        key: 'vrRateioFaixa6',
        render: value => value === 0 ? 'Acumulado' : `R$${this.formatMoney(value)}`
      },
      14: {
        key: 'vrAcumuladoFaixa1',
        render: value => this.formatMoney(value)
      },
      15: {
        key: 'vrArrecadado',
        render: value => this.formatMoney(value)
      },
      16: {
        key: 'dtApuracao',
        render: (value) => moment(value).format('YYYYMMDD200000')
      },
      17: 'concurso',
      18: {
        key: 'resultadoOrdenado',
        render: (value) => value.split('-').join(',')
      },
      19: {
        key: 'dtProximoConcurso',
        render: (value) => moment(value).format('YYYYMMDD200000')
      },
      20: {
        key: 'vrEstimativa',
        render: value => this.formatMoney(value)
      }
    }

    const values = this.getValues(data, keys)

    const result = `
    {
      "breakdown": [
        {
          "name": "Premiação",
          "detail": [
            {
              "name": "20 números acertados",
              "count": ${values[0]},
              "amount": "${values[7]}"
            },
            {
              "name": "19 números acertados",
              "count": ${values[1]},
              "amount": "${values[8]}"
            },
            {
              "name": "18 números acertados",
              "count": ${values[2]},
              "amount": "R$${values[9]}"
            },
            {
              "name": "17 números acertados",
              "count": ${values[3]},
              "amount": "R$${values[10]}"
            },
            {
              "name": "16 números acertados",
              "count": ${values[4]},
              "amount": "R$${values[11]}"
            },
            {
              "name": "15 números acertados",
              "count": ${values[5]},
              "amount": "R$${values[12]}"
            },
            {
              "name": "0 números acertados",
              "count": ${values[6]},
              "amount": "${values[13]}"
            }
          ]
        }
      ],
      "jackpot": [],
      "other": [
        {
          "name": "Acumulado próximo concurso",
          "value": "R$${values[14]}"
        },
        {
          "name": "Arrecadação total",
          "value": "R$${values[15]}"
        }
      ],
      "drawTime": "${values[16]}",
      "issue": "${values[17]}",
      "numbers": "${values[18]}",
      "name": "Lotomania",
      "lotteryID": "br-lotomania",
      "nextDrawTime": "${values[19]}",
      "nextPoolSize": "R$${values[20]}"
    }    
    `
    try {
      return JSON.parse(result)
    } catch (err) {
      throw new VError(err, `br crawler :${this.lotteryId} parse json result error\n${result}`)
    }
  }
}

const brLotomania = new BrLotomania()

// async function main () {
//   // eslint-disable-next-line no-console
//   console.log(require('util').inspect(await brLotomania.crawl('2103'), false, null, true))
// }

// main()

module.exports = {
  crawl: brLotomania.crawl.bind(brLotomania)
}
