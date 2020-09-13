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
        key: 'qt_GANHADOR_FAIXA_1',
        render: value => parseInt(value)
      },
      1: 'qt_GANHADOR_FAIXA_2',
      2: 'qt_GANHADOR_FAIXA_3',
      3: 'qt_GANHADOR_FAIXA_4',
      4: 'qt_GANHADOR_MES_DE_SORTE',
      5: {
        key: 'vr_RATEIO_FAIXA_1',
        render: (value) => value === 0 ? 'Não houve acertador' : `R$${this.formatMoney(value)}`
      },
      6: {
        key: 'vr_RATEIO_FAIXA_2',
        render: (value) => this.formatMoney(value)
      },
      7: {
        key: 'vr_RATEIO_FAIXA_3',
        render: (value) => this.formatMoney(value)
      },
      8: {
        key: 'vr_RATEIO_FAIXA_4',
        render: (value) => this.formatMoney(value)
      },
      9: {
        key: 'vr_RATEIO_MES_DE_SORTE',
        render: (value) => this.formatMoney(value)
      },
      10: {
        key: 'vr_ACUMULADO',
        render: (value) => value === 0 ? '' : `{
          "name": "Acumulado próximo concurso",
          "value": "R$${this.formatMoney(value)}"
        },`
      },
      11: {
        key: 'vr_ARRECADADO',
        render: (value) => this.formatMoney(value)
      },
      12: {
        key: 'dt_APURACAO',
        render: (value) => moment(value).format('YYYYMMDD200000')
      },
      13: 'concursoAnterior',
      14: {
        key: 'resultadoOrdenado',
        render: (value) => value.split('-').join(',')
      },
      15: 'mes_DE_SORTE',
      16: {
        key: 'dt_PROXIMO_CONCURSO',
        render: (value) => moment(value).format('YYYYMMDD200000')
      },
      17: {
        key: 'vr_ESTIMATIVA',
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
