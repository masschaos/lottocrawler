/**
 * @Author: maple
 * @Date: 2020-08-30 09:05:16
 * @LastEditors: maple
 * @LastEditTime: 2020-09-01 22:08:33
 */
const Crawler = require('./index')
const VError = require('verror')
// const log = require('../../../util/log')
const moment = require('moment')

class BrLotomania extends Crawler {
  constructor () {
    const config = {
      lotteryID: 'br-lotomania'
    }
    super(config)

    this.url = 'http://loterias.caixa.gov.br/wps/portal/loterias/landing/lotomania/!ut/p/a1/04_Sj9CPykssy0xPLMnMz0vMAfGjzOLNDH0MPAzcDbz8vTxNDRy9_Y2NQ13CDA38jYEKIoEKnN0dPUzMfQwMDEwsjAw8XZw8XMwtfQ0MPM2I02-AAzgaENIfrh-FqsQ9wBmoxN_FydLAGAgNTKEK8DkRrACPGwpyQyMMMj0VAajYsZo!/dl5/d5/L2dBISEvZ0FBIS9nQSEh/pw/Z7_61L0H0G0JGJVA0AKLR5T3K00V0/res/id=buscaResultado/c=cacheLevelPage/=/'
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
        render: (value) => value[6].numeroDeGanhadores
      },
      7: {
        key: 'listaRateioPremio',
        render: (value) => value[0].valorPremio === 0 ? 'Nã houve acertador' : this.formatMoney(value[0].valorPremio)
      },
      8: {
        key: 'listaRateioPremio',
        render: (value) => value[1].valorPremio === 0 ? 'Nã houve acertador' : this.formatMoney(value[1].valorPremio)
      },
      9: {
        key: 'listaRateioPremio',
        render: (value) => value[2].valorPremio === 0 ? 'Nã houve acertador' : this.formatMoney(value[2].valorPremio)
      },
      10: {
        key: 'listaRateioPremio',
        render: (value) => value[3].valorPremio === 0 ? 'Nã houve acertador' : this.formatMoney(value[3].valorPremio)
      },
      11: {
        key: 'listaRateioPremio',
        render: (value) => value[4].valorPremio === 0 ? 'Nã houve acertador' : this.formatMoney(value[4].valorPremio)
      },
      12: {
        key: 'listaRateioPremio',
        render: (value) => value[5].valorPremio === 0 ? 'Nã houve acertador' : this.formatMoney(value[5].valorPremio)
      },
      13: {
        key: 'listaRateioPremio',
        render: (value) => value[6].valorPremio === 0 ? 'Nã houve acertador' : this.formatMoney(value[6].valorPremio)
      },
      14: {
        key: 'valorAcumuladoProximoConcurso',
        render: (value) => this.formatMoney(value)
      },
      15: {
        key: 'valorArrecadado',
        render: value => this.formatMoney(value)
      },
      16: {
        key: 'dataApuracao',
        render: (value) => moment(value, 'DD/MM/YYYY').format('YYYYMMDD200000')
      },
      17: 'numero',
      18: {
        key: 'listaDezenas',
        render: (value) => value && value.map(item => item.slice(1)).join(',')
      },
      19: {
        key: 'dataProximoConcurso',
        render: (value) => moment(value, 'DD/MM/YYYY').format('YYYYMMDD200000')
      },
      20: {
        key: 'valorEstimadoProximoConcurso',
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
      throw new VError(err, `br crawler :${this.lotteryID} parse json result error\n${result}`)
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
