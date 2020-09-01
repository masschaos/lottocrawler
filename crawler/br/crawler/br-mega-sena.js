/**
 * @Author: maple
 * @Date: 2020-08-30 09:05:16
 * @LastEditors: maple
 * @LastEditTime: 2020-09-01 12:03:50
 */
const Crawler = require('./index')
const VError = require('verror')
// const log = require('../../../util/log')
const moment = require('moment')

class BrMegaSena extends Crawler {
  constructor () {
    const config = {
      lotteryId: 'br-mega-sena'
    }
    super(config)

    this.url = 'http://loterias.caixa.gov.br/wps/portal/loterias/landing/megasena/!ut/p/a1/04_Sj9CPykssy0xPLMnMz0vMAfGjzOLNDH0MPAzcDbwMPI0sDBxNXAOMwrzCjA0sjIEKIoEKnN0dPUzMfQwMDEwsjAw8XZw8XMwtfQ0MPM2I02-AAzgaENIfrh-FqsQ9wNnUwNHfxcnSwBgIDUyhCvA5EawAjxsKckMjDDI9FQE-F4ca/dl5/d5/L2dBISEvZ0FBIS9nQSEh/pw/Z7_HGK818G0KO6H80AU71KG7J0072/res/id=buscaResultado/c=cacheLevelPage/=/'
  }

  render (data) {
    const keys = {
      0: 'ganhadores',
      1: 'ganhadores_quina',
      2: 'ganhadores_quadra',
      3: {
        key: 'valor',
        render: (value) => value === 0 ? 'Acumulado' : `R$${this.formatMoney(value)}`
      },
      4: {
        key: 'valor_quina',
        render: value => this.formatMoney(value)
      },
      5: {
        key: 'valor_quadra',
        render: value => this.formatMoney(value)
      },
      6: {
        key: 'valor_acumulado',
        render: (value) => this.formatMoney(value)
      },
      7: {
        key: 'ac_final_zero',
        render: (value) => this.formatMoney(value)
      },
      8: {
        key: 'vr_acumulado_especial',
        render: (value) => this.formatMoney(value)
      },
      9: {
        key: 'vr_arrecadado',
        render: (value) => this.formatMoney(value)
      },
      10: {
        key: 'data',
        render: (value) => moment(value).format('YYYYMMDD000000')
      },
      11: 'concurso',
      12: {
        key: 'resultado',
        render: (value) => value.split('-').join(',')
      },
      13: {
        key: 'dt_proximo_concurso',
        render: (value) => moment(value).format('YYYYMMDD000000')
      },
      14: {
        key: 'vr_estimativa',
        render: (value) => this.formatMoney(value)
      }
    }

    const values = this.getValues(data, keys)

    const result = `
    {
      "breakdown": [
        {
          "name": "main",
          "detail": [
            {
              "name": "Sena - 6 números acertados",
              "count": ${values[0]},
              "amount": "${values[3]}"
            },
            {
              "name": "Quina - 5 números acertados",
              "count": ${values[1]},
              "amount": "R$${values[4]}"
            },
            {
              "name": "Quadra - 4 números acertados",
              "count": ${values[2]},
              "amount": "R$${values[5]}"
            }
          ]
        }
      ],
      "jackpot": [],
      "other": [
        {
          "name": "Acumulado próximo concurso",
          "value": "R$${values[6]}"
        },
        {
          "name": "Acumulado próximo concurso()",
          "value": "R$${values[7]}"
        },
        {
          "name": "Acumulado para Sorteio",
          "value": "R$${values[8]}"
        },
        {
          "name": "Arrecadação total",
          "value": "R$${values[9]}"
        }
      ],
      "drawTime": "${values[10]}",
      "issue": "${values[11]}",
      "numbers": "${values[12]}",
      "name": "Mega-Sena",
      "lotteryID": "br-mega-sena",
      "nextDrawTime": "${values[13]}",
      "nextPoolSize": "R$ ${values[14]}"
    }
    `
    try {
      return JSON.parse(result)
    } catch (err) {
      throw new VError(err, `br crawler :${this.lotteryId} parse json result error\n${result}`)
    }
  }
}

const brMegaSena = new BrMegaSena()

// async function main () {
//   // eslint-disable-next-line no-console
//   console.log(require('util').inspect(await brMegaSena.crawl('2103'), false, null, true))
// }

// main()

module.exports = {
  crawl: brMegaSena.crawl.bind(brMegaSena)
}
