/**
 * @Author: maple
 * @Date: 2020-08-30 09:05:16
 * @LastEditors: maple
 * @LastEditTime: 2020-09-01 22:08:56
 */
const Crawler = require('./index')
const VError = require('verror')
// const log = require('../../../util/log')
const moment = require('moment')

class BrTimemania extends Crawler {
  constructor () {
    const config = {
      lotteryID: 'br-timemania'
    }
    super(config)

    this.url = 'http://loterias.caixa.gov.br/wps/portal/loterias/landing/timemania/!ut/p/a1/04_Sj9CPykssy0xPLMnMz0vMAfGjzOLNDH0MPAzcDbz8vTxNDRy9_Y2NQ13CDA1MzIEKIoEKnN0dPUzMfQwMDEwsjAw8XZw8XMwtfQ0MPM2I02-AAzgaENIfrh-FqsQ9wBmoxN_FydLAGAgNTKEK8DkRrACPGwpyQyMMMj0VASrq9qk!/dl5/d5/L2dBISEvZ0FBIS9nQSEh/pw/Z7_61L0H0G0JGJVA0AKLR5T3K00M4/res/id=buscaResultado/c=cacheLevelPage/=/'
  }

  render (data) {
    const keys = {
      0: {
        key: 'listaRateioPremio',
        render: (value) => value[0].numeroDeGanhadores
      },
      1: {
        key: 'listaRateioPremio',
        render: (value) => value[1].numeroDeGanhadores
      },
      2: {
        key: 'listaRateioPremio',
        render: (value) => value[2].numeroDeGanhadores
      },
      3: {
        key: 'listaRateioPremio',
        render: (value) => value[3].numeroDeGanhadores
      },
      4: {
        key: 'listaRateioPremio',
        render: (value) => value[4].numeroDeGanhadores
      },
      5: {
        key: 'listaRateioPremio',
        render: (value) => value[5].numeroDeGanhadores
      },
      6: {
        key: 'listaRateioPremio',
        render: (value) => value[0].valorPremio === 0 ? 'Não houve acertador' : `R$${this.formatMoney(value[0].valorPremio)}`
      },
      7: {
        key: 'listaRateioPremio',
        render: (value) => value[1].valorPremio === 0 ? 'Não houve acertador' : `R$${this.formatMoney(value[1].valorPremio)}`
      },
      8: {
        key: 'listaRateioPremio',
        render: (value) => value[2].valorPremio === 0 ? 'Não houve acertador' : `${this.formatMoney(value[2].valorPremio)}`
      },
      9: {
        key: 'listaRateioPremio',
        render: (value) => value[3].valorPremio === 0 ? 'Não houve acertador' : `${this.formatMoney(value[3].valorPremio)}`
      },
      10: {
        key: 'listaRateioPremio',
        render: (value) => value[4].valorPremio === 0 ? 'Não houve acertador' : `${this.formatMoney(value[4].valorPremio)}`
      },
      11: {
        key: 'listaRateioPremio',
        render: (value) => value[5].valorPremio === 0 ? 'Não houve acertador' : `${this.formatMoney(value[5].valorPremio)}`
      },
      12: {
        key: 'valorAcumuladoProximoConcurso',
        render: value => this.formatMoney(value)
      },
      13: {
        key: 'valorAcumuladoConcurso_0_5',
        render: value => this.formatMoney(value)
      },
      14: {
        key: 'valorArrecadado',
        render: value => this.formatMoney(value)
      },
      15: {
        key: 'dataApuracao',
        render: (value) => moment(value, 'DD/MM/YYYY').format('YYYYMMDD000000')
      },
      16: 'numero',
      17: {
        key: 'listaDezenas',
        render: (value) => value && value.map(item => item.slice(1)).join(',')
      },
      18: 'numeroJogo',
      19: {
        key: 'dataProximoConcurso',
        render: (value) => moment(value, 'DD/MM/YYYY').format('YYYYMMDD000000')
      },
      20: {
        key: 'valorEstimadoProximoConcurso',
        render: (value) => this.formatMoney(value)
      },
      21: {
        key: 'nomeTimeCoracaoMesSorte'
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
              "name": "7 números acertados",
              "count": ${values[0]},
              "amount": "${values[6]}"
            },
            {
              "name": "6 números acertados",
              "count": ${values[1]},
              "amount": "${values[7]}"
            },
            {
              "name": "5 números acertados",
              "count": ${values[2]},
              "amount": "R$${values[8]}"
            },
            {
              "name": "4 números acertados",
              "count": ${values[3]},
              "amount": "R$${values[9]}"
            },
            {
              "name": "3 números acertados",
              "count": ${values[4]},
              "amount": "R$${values[10]}"
            },
            {
              "name": "Time do Coração",
              "count": ${values[5]},
              "amount": "R$${values[11]}"
            }
          ]
        }
      ],
      "jackpot": [],
      "other": [
        {
          "name": "Acumulado próximo concurso",
          "value": "R$${values[12]}"
        },
        {
          "name": "Acumulado próximo concurso final zero",
          "value": "R$${values[13]}"
        },
        {
          "name": "Arrecadação total",
          "value": "R$${values[14]}"
        },
        {"name":"timeCoracao","value":"${values[21].split('\u0000').join('')}"}
      ],
      "drawTime": "${values[15]}",
      "issue": "${values[16]}",
      "numbers": "${values[17]}|${values[18]}",
      "name": "Timemania",
      "lotteryID": "br-timemania",
      "nextDrawTime": "${values[19]}",
      "nextPoolSize": "R$${values[20]}"
    }
    `
    try {
      return JSON.parse(result)
    } catch (err) {
      throw new VError(err, `br crawler :${this.lotteryID} parse json result error\n${result}`)
    }
  }
}

const brTimemania = new BrTimemania()

// async function main () {
//   // eslint-disable-next-line no-console
//   console.log(require('util').inspect(await brTimemania.crawl('1528'), false, null, true))
// }

// main()

module.exports = {
  crawl: brTimemania.crawl.bind(brTimemania)
}
