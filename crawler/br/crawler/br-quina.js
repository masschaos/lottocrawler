/**
 * @Author: maple
 * @Date: 2020-08-30 09:05:16
 * @LastEditors: maple
 * @LastEditTime: 2020-09-01 22:08:45
 */
const Crawler = require('./index')
const VError = require('verror')
// const log = require('../../../util/log')
const moment = require('moment')

class BrQuina extends Crawler {
  constructor () {
    const config = {
      lotteryID: 'br-quina'
    }
    super(config)

    this.url = 'http://loterias.caixa.gov.br/wps/portal/loterias/landing/quina/!ut/p/a1/jc69DoIwAATgZ_EJepS2wFgoaUswsojYxXQyTfgbjM9vNS4Oordd8l1yxJGBuNnfw9XfwjL78dmduIikhYFGA0tzSFZ3tG_6FCmP4BxBpaVhWQuA5RRWlUZlxR6w4r89vkTi1_5E3CfRXcUhD6osEAHA32Dr4gtsfFin44Bgdw9WWSwj/dl5/d5/L2dBISEvZ0FBIS9nQSEh/pw/Z7_61L0H0G0J0VSC0AC4GLFAD20G6/res/id=buscaResultado/c=cacheLevelPage/=/'
  }

  render (data) {
    const keys = {
      0: {
        key: 'listaRateioPremio',
        render: (value) => value[0].numeroDeGanhadores
      },
      4: {
        key: 'listaRateioPremio',
        render: (value) => value[0].valorPremio === 0 ? 'Não houve acertador' : `R$${this.formatMoney(value[0].valorPremio)}`
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
      5: {
        key: 'listaRateioPremio',
        render: (value) => this.formatMoney(value[1].valorPremio)
      },
      6: {
        key: 'listaRateioPremio',
        render: (value) => this.formatMoney(value[2].valorPremio)
      },
      7: {
        key: 'listaRateioPremio',
        render: (value) => this.formatMoney(value[3].valorPremio)
      },
      8: {
        key: 'valorAcumuladoProximoConcurso',
        render: value => this.formatMoney(value)
      },
      9: {
        key: 'valorAcumuladoConcursoEspecial',
        render: value => this.formatMoney(value)
      },
      10: {
        key: 'valorArrecadado',
        render: value => this.formatMoney(value)
      },
      11: {
        key: 'dataApuracao',
        render: (value) => moment(value, 'DD/MM/YYYY').format('YYYYMMDD200000')
      },
      12: 'numero',
      13: {
        key: 'listaDezenas',
        render: (value) => value.map(item => item.slice(1)).join(',')
      },
      14: {
        key: 'dataProximoConcurso',
        render: (value) => moment(value, 'DD/MM/YYYY').format('YYYYMMDD200000')
      },
      15: {
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
              "name": "Quina - 5 números acertados",
              "count": ${values[0]},
              "amount": "${values[4]}"
            },
            {
              "name": "Quadra - 4 números acertados",
              "count": ${values[1]},
              "amount": "R$${values[5]}"
            },
            {
              "name": "Terno - 3 números acertados",
              "count": ${values[2]},
              "amount": "R$${values[6]}"
            },
            {
              "name": "Duque - 2 números acertados",
              "count": ${values[3]},
              "amount": "R$${values[7]}"
            }
          ]
        }
      ],
      "jackpot": [],
      "other": [
        {
          "name": "Acumulado próximo concurso",
          "value": "R$${values[8]}"
        },
        {
          "name": "Acumulado para Sorteio Especial de São João",
          "value": "R$${values[9]}"
        },
        {
          "name": "Arrecadação total",
          "value": "R$${values[10]}"
        }
      ],
      "drawTime": "${values[11]}",
      "issue": "${values[12]}",
      "numbers": "${values[13]}",
      "name": "Quina",
      "lotteryID": "br-quina",
      "nextDrawTime": "${values[14]}",
      "nextPoolSize": "R$${values[15]}"
    }
    `
    try {
      return JSON.parse(result)
    } catch (err) {
      throw new VError(err, `br crawler :${this.lotteryID} parse json result error\n${result}`)
    }
  }
}

const brQuina = new BrQuina()

// async function main () {
//   // eslint-disable-next-line no-console
//   console.log(require('util').inspect(await brQuina.crawl('5349'), false, null, true))
// }

// main()

module.exports = {
  crawl: brQuina.crawl.bind(brQuina)
}
