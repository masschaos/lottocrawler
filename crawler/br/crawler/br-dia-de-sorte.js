/**
 * @Author: maple
 * @Date: 2020-08-30 09:05:16
 * @LastEditors: maple
 * @LastEditTime: 2020-09-01 22:05:42
 */
const Crawler = require('./index')
const VError = require('verror')
const moment = require('moment')

class BrDiaDeSorte extends Crawler {
  constructor () {
    const config = {
      lotteryID: 'br-dia-de-sorte'
    }
    super(config)

    this.url = 'http://loterias.caixa.gov.br/wps/portal/loterias/landing/diadesorte/!ut/p/a1/jc5BDsIgFATQs3gCptICXdKSfpA2ujFWNoaVIdHqwnh-sXFr9c_qJ2-SYYGNLEzxmc7xkW5TvLz_IE6WvCoUwZPwArpTnZWD4SCewTGDlrQtZQ-gVGs401gj6wFw4r8-vpzGr_6BhZmIoocFYUO7toLemqYGz0H1AUsTZ7Cw4X7dj0hu9QIyUWUw/dl5/d5/L2dBISEvZ0FBIS9nQSEh/pw/Z7_HGK818G0KO5GE0Q8PTB11800G3/res/id=buscaResultado/c=cacheLevelPage/=/'
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
        render: (value) => value[0].valorPremio === 0 ? 'Não houve acertador' : `${this.formatMoney(value[0].valorPremio)}`
      },
      6: {
        key: 'listaRateioPremio',
        render: (value) => value[1].valorPremio === 0 ? 'Não houve acertador' : `${this.formatMoney(value[1].valorPremio)}`
      },
      7: {
        key: 'listaRateioPremio',
        render: (value) => value[2].valorPremio === 0 ? 'Não houve acertador' : `${this.formatMoney(value[2].valorPremio)}`
      },
      8: {
        key: 'listaRateioPremio',
        render: (value) => value[3].valorPremio === 0 ? 'Não houve acertador' : `${this.formatMoney(value[3].valorPremio)}`
      },
      9: {
        key: 'listaRateioPremio',
        render: (value) => value[4].valorPremio === 0 ? 'Não houve acertador' : `${this.formatMoney(value[4].valorPremio)}`
      },
      10: {
        key: 'valorAcumuladoProximoConcurso',
        render: (value) => value === 0 ? '' : `{
          "name": "Acumulado próximo concurso",
          "value": "R$${this.formatMoney(value)}"
        },`
      },
      11: {
        key: 'valorArrecadado',
        render: (value) => this.formatMoney(value)
      },
      12: {
        key: 'dataApuracao',
        render: (value) => moment(value, 'DD/MM/YYYY').format('YYYYMMDD200000')
      },
      13: 'numero',
      14: {
        key: 'listaDezenas',
        render: (value) => value && value.map(item => item.slice(1)).join(',')
      },
      15: 'numeroJogo',
      16: {
        key: 'dataProximoConcurso',
        render: (value) => moment(value, 'DD/MM/YYYY').format('YYYYMMDD200000')
      },
      17: {
        key: 'valorEstimadoProximoConcurso',
        render: (value) => this.formatMoney(value)
      },
      18: {
        key: 'ganhadoresPorUf',
        render: (items) => items ? items.map(item => {
          const data = `,
          {
            "name": "Detalhamento|${item.noCidade} - ${item.sgUf}",
            "value": "${item.qtGanhadores} aposta ganhou o prêmio para 7 acertos"
          }`
          return data
        }).join('\n') : ''
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
              "name": "7 números acertados",
              "count": ${values[0]},
              "prize": "${values[5]}"
            },
            {
              "name": "6 números acertados",
              "count": ${values[1]},
              "prize": "R$${values[6]}"
            },
            {
              "name": "5 números acertados",
              "count": ${values[2]},
              "prize": "R$${values[7]}"
            },
            {
              "name": "4 números acertados",
              "count": ${values[3]},
              "prize": "R$${values[8]}"
            },
            {
              "name": "Mês da Sorte",
              "count": ${values[4]},
              "prize": "R$${values[9]}"
            }
          ]
        }
      ],
      "jackpot": [],
      "other": [
        ${values[10]}
        {
          "name": "Arrecadação total",
          "value": "R$${values[11]}"
        }
        ${values[18]}
      ],
      "drawTime": "${values[12]}",
      "issue": "${values[13]}",
      "numbers": "${values[14]}|${values[15]}",
      "name": "dia de sorte",
      "lotteryID": "br-dia-de-sorte",
      "nextDrawTime": "${values[16]}",
      "nextPoolSize": "R$${values[17]}"
    }
    `
    try {
      return JSON.parse(result)
    } catch (err) {
      throw new VError(err, `br crawler :${this.lotteryID} parse json result error\n${result}`)
    }
  }
}

const brDiaDeSorte = new BrDiaDeSorte()

// async function main () {
//   // eslint-disable-next-line no-console
//   console.log(require('util').inspect(await brDiaDeSorte.crawl('348'), false, null, true))
// }

// main()

module.exports = {
  crawl: brDiaDeSorte.crawl.bind(brDiaDeSorte)
}
