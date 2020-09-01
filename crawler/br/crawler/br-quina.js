/**
 * @Author: maple
 * @Date: 2020-08-30 09:05:16
 * @LastEditors: maple
 * @LastEditTime: 2020-08-30 15:44:50
 */
const Crawler = require('./index')
const VError = require('verror')
// const log = require('../../../util/log')
const moment = require('moment')

class BrQuina extends Crawler {
  constructor () {
    const config = {
      lotteryId: 'br-mega-sena'
    }
    super(config)

    this.url = 'http://loterias.caixa.gov.br/wps/portal/loterias/landing/quina/!ut/p/a1/jc69DoIwAATgZ_EJepS2wFgoaUswsojYxXQyTfgbjM9vNS4Oordd8l1yxJGBuNnfw9XfwjL78dmduIikhYFGA0tzSFZ3tG_6FCmP4BxBpaVhWQuA5RRWlUZlxR6w4r89vkTi1_5E3CfRXcUhD6osEAHA32Dr4gtsfFin44Bgdw9WWSwj/dl5/d5/L2dBISEvZ0FBIS9nQSEh/pw/Z7_61L0H0G0J0VSC0AC4GLFAD20G6/res/id=buscaResultado/c=cacheLevelPage/=/'
  }

  render (data) {
    const keys = {
      0: 'ganhadores',
      1: 'ganhadores_quadra',
      2: 'ganhadores_terno',
      3: 'qt_ganhador_duque',
      4: {
        key: 'valor',
        render: value => value === 0 ? 'Acumulado' : `R$${this.formatMoney(value)}`
      },
      5: {
        key: 'valor_quadra',
        render: value => this.formatMoney(value)
      },
      6: {
        key: 'valor_terno',
        render: value => this.formatMoney(value)
      },
      7: {
        key: 'vr_rateio_duque',
        render: value => this.formatMoney(value)
      },
      8: {
        key: 'vrAcumulado',
        render: value => this.formatMoney(value)
      },
      9: {
        key: 'vrAcumuladoEspecial',
        render: value => this.formatMoney(value)
      },
      10: {
        key: 'vrArrecadado',
        render: value => this.formatMoney(value)
      },
      11: {
        key: 'data',
        render: (value) => moment(value).format('YYYYMMDD200000')
      },
      12: 'concurso',
      13: {
        key: 'resultadoOrdenado',
        render: (value) => value.split('-').join(',')
      },
      14: {
        key: 'dtProximoConcurso',
        render: (value) => moment(value).format('YYYYMMDD200000')
      },
      15: {
        key: 'vrEstimado',
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
      throw new VError(err, `br crawler :${this.lotteryId} parse json result error\n${result}`)
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
