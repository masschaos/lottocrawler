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
      lotteryID: 'br-mega-sena'
    }
    super(config)

    this.url = 'http://loterias.caixa.gov.br/wps/portal/loterias/landing/megasena/!ut/p/a1/04_Sj9CPykssy0xPLMnMz0vMAfGjzOLNDH0MPAzcDbwMPI0sDBxNXAOMwrzCjA0sjIEKIoEKnN0dPUzMfQwMDEwsjAw8XZw8XMwtfQ0MPM2I02-AAzgaENIfrh-FqsQ9wNnUwNHfxcnSwBgIDUyhCvA5EawAjxsKckMjDDI9FQE-F4ca/dl5/d5/L2dBISEvZ0FBIS9nQSEh/pw/Z7_HGK818G0KO6H80AU71KG7J0072/res/id=buscaResultado/c=cacheLevelPage/=/'
  }

  render (data) {
    const keys = {
      0: {
        key: 'listaRateioPremio',
        render: (value) => value[0].numeroDeGanhadores
      },
      1: {
        key: 'listaRateioPremio',
        render: (value) => this.formatMoney(value[0].valorPremio)
      },
      2: {
        key: 'listaRateioPremio',
        render: (value) => value[1].numeroDeGanhadores
      },
      3: {
        key: 'listaRateioPremio',
        render: (value) => this.formatMoney(value[1].valorPremio)
      },
      4: {
        key: 'listaRateioPremio',
        render: (value) => value[2].numeroDeGanhadores
      },
      5: {
        key: 'listaRateioPremio',
        render: (value) => this.formatMoney(value[2].valorPremio)
      },
      6: {
        key: 'valorAcumuladoProximoConcurso',
        render: (value) => this.formatMoney(value)
      },
      7: {
        key: 'valorAcumuladoConcurso_0_5',
        render: (value) => this.formatMoney(value)
      },
      8: {
        key: 'valorAcumuladoConcursoEspecial',
        render: (value) => this.formatMoney(value)
      },
      9: {
        key: 'valorArrecadado',
        render: (value) => this.formatMoney(value)
      },
      10: {
        key: 'dataApuracao',
        render: (value) => moment(value, 'DD/MM/YYYY').format('YYYYMMDD000000')
      },
      11: 'numero',
      12: {
        key: 'listaDezenas',
        render: (value) => value && value.map(item => item.slice(1)).join(',')
      },
      13: {
        key: 'dataProximoConcurso',
        render: (value) => moment(value, 'DD/MM/YYYY').format('YYYYMMDD000000')
      },
      14: {
        key: 'valorEstimadoProximoConcurso',
        render: (value) => this.formatMoney(value)
      },
      15: {
        key: 'numeroConcursoFinal_0_5'
      }
    }

    const values = this.getValues(data, keys)
    const otherFinal = values[11] % 10 < 5 ? 'cinco' : 'zero'
    const result = `
    {
      "breakdown": [
        {
          "name": "main",
          "detail": [
            {
              "name": "Sena - 6 números acertados",
              "count": ${values[0]},
              "amount": "R$${values[1]}"
            },
            {
              "name": "Quina - 5 números acertados",
              "count": ${values[2]},
              "amount": "R$${values[3]}"
            },
            {
              "name": "Quadra - 4 números acertados",
              "count": ${values[4]},
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
          "name": "Acumulado próximo concurso final ${otherFinal} (${values[15]})",
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
      throw new VError(err, `br crawler :${this.lotteryID} parse json result error\n${result}`)
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
