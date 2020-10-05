/**
 * @Author: maple
 * @Date: 2020-08-30 09:05:16
 * @LastEditors: maple
 * @LastEditTime: 2020-09-01 22:06:33
 */
const Crawler = require('./index')
const VError = require('verror')
// const log = require('../../../util/log')
const moment = require('moment')

class BrLotofacil extends Crawler {
  constructor () {
    const config = {
      lotteryID: 'br-lotofacil'
    }
    super(config)

    this.url = 'http://loterias.caixa.gov.br/wps/portal/loterias/landing/lotofacil/!ut/p/a1/04_Sj9CPykssy0xPLMnMz0vMAfGjzOLNDH0MPAzcDbz8vTxNDRy9_Y2NQ13CDA0sTIEKIoEKnN0dPUzMfQwMDEwsjAw8XZw8XMwtfQ0MPM2I02-AAzgaENIfrh-FqsQ9wBmoxN_FydLAGAgNTKEK8DkRrACPGwpyQyMMMj0VAcySpRM!/dl5/d5/L2dBISEvZ0FBIS9nQSEh/pw/Z7_61L0H0G0J0VSC0AC4GLFAD2003/res/id=buscaResultado/c=cacheLevelPage/=/'
  }

  render (data) {
    const keys = {
      0: {
        key: 'listaRateioPremio',
        render: (value) => value[0].numeroDeGanhadores
      },
      4: {
        key: 'listaRateioPremio',
        render: (value) => value[4].numeroDeGanhadores
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
        render: (value) => this.formatMoney(value[0].valorPremio)
      },
      6: {
        key: 'listaRateioPremio',
        render: (value) => this.formatMoney(value[1].valorPremio)
      },
      7: {
        key: 'listaRateioPremio',
        render: (value) => this.formatMoney(value[2].valorPremio)
      },
      8: {
        key: 'listaRateioPremio',
        render: (value) => this.formatMoney(value[3].valorPremio)
      },
      9: {
        key: 'listaRateioPremio',
        render: (value) => this.formatMoney(value[4].valorPremio)
      },
      10: 'valorAcumuladoConcursoEspecial',
      11: 'valorArrecadado',
      12: {
        key: 'ganhadoresPorUf',
        render: (items) => items ? items.map(item => {
          const data = `,
          {
            "name": "Detalhamento|${item.noCidade} - ${item.sgUf}",
            "value": "${item.qtGanhadores} aposta ganhou o prêmio para 15 acertos"
          }`
          return data
        }).join('\n') : ''
      },
      13: {
        key: 'dataApuracao',
        render: (value) => moment(value, 'DD/MM/YYYY').format('YYYYMMDD200000')
      },
      14: 'numero',
      15: {
        key: 'listaDezenas',
        render: (value) => value.map(item => item.slice(1)).join(',')
      },
      16: {
        key: 'dataProximoConcurso',
        render: (value) => moment(value, 'DD/MM/YYYY').format('YYYYMMDD200000')
      },
      17: 'valorEstimadoProximoConcurso',
      18: 'valorAcumuladoConcurso_0_5'
    }

    const values = this.getValues(data, keys)

    const result = `
    {
      "breakdown": [
        {
          "name": "Premiação",
          "detail": [
            {
              "name": "15 acertos",
              "count": ${values[0]},
              "amount": "R$${values[5]}"
            },
            {
              "name": "14 acertos",
              "count": ${values[1]},
              "amount": "R$${values[6]}"
            },
            {
              "name": "13 acertos",
              "count": ${values[2]},
              "amount": "R$${values[7]}"
            },
            {
              "name": "12 acertos",
              "count": ${values[3]},
              "amount": "R$${values[8]}"
            },
            {
              "name": "11 acertos",
              "count": ${values[4]},
              "amount": "R$${values[9]}"
            }
          ]
        }
      ],
      "jackpot": [],
      "other": [
        {
          "name": "Valor acumulado",
          "value": "R$${values[18]}"
        },
        {
          "name": "Acumulado para Sorteio Especial da Independência",
          "value": "R$${values[10]}"
        },
        {
          "name": "Arrecadação total",
          "value": "R$${values[11]}"
        }
        ${values[12]}
      ],
      "drawTime": "${values[13]}",
      "issue": "${values[14]}",
      "numbers": "${values[15]}",
      "name": "Lotofacil",
      "lotteryID": "br-lotofacil",
      "nextDrawTime": "${values[16]}",
      "nextPoolSize": "R$ ${this.formatMoney(values[17])}"
    }
    `
    try {
      return JSON.parse(result)
    } catch (err) {
      throw new VError(err, `br crawler :${this.lotteryID} parse json result error\n${result}`)
    }
  }
}

const brLotofail = new BrLotofacil()

// async function main () {
//   // eslint-disable-next-line no-console
//   console.log(require('util').inspect(await brLotofail.crawl(), false, null, true))
// }

// main()

module.exports = {
  crawl: brLotofail.crawl.bind(brLotofail)
}
