/**
 * @Author: maple
 * @Date: 2020-08-30 09:05:16
 * @LastEditors: maple
 * @LastEditTime: 2020-08-30 15:52:42
 */
const Crawler = require('./index')
const VError = require('verror')
// const log = require('../../../util/log')
const moment = require('moment')

class BrLotofacil extends Crawler {
  constructor () {
    const config = {
      lotteryId: 'br-mega-sena'
    }
    super(config)

    this.url = 'http://loterias.caixa.gov.br/wps/portal/loterias/landing/lotofacil/!ut/p/a1/04_Sj9CPykssy0xPLMnMz0vMAfGjzOLNDH0MPAzcDbz8vTxNDRy9_Y2NQ13CDA0sTIEKIoEKnN0dPUzMfQwMDEwsjAw8XZw8XMwtfQ0MPM2I02-AAzgaENIfrh-FqsQ9wBmoxN_FydLAGAgNTKEK8DkRrACPGwpyQyMMMj0VAcySpRM!/dl5/d5/L2dBISEvZ0FBIS9nQSEh/pw/Z7_61L0H0G0J0VSC0AC4GLFAD2003/res/id=buscaResultado/c=cacheLevelPage/=/'
  }

  render (data) {
    const keys = {
      0: 'qt_ganhador_faixa1',
      1: 'qt_ganhador_faixa2',
      2: 'qt_ganhador_faixa3',
      3: 'qt_ganhador_faixa4',
      4: 'qt_ganhador_faixa5',
      5: 'vr_rateio_faixa1',
      6: {
        key: 'vr_rateio_faixa2',
        render: value => this.formatMoney(value)
      },
      7: {
        key: 'vr_rateio_faixa3',
        render: value => this.formatMoney(value)
      },
      8: {
        key: 'vr_rateio_faixa4',
        render: value => this.formatMoney(value)
      },
      9: {
        key: 'vr_rateio_faixa5',
        render: value => this.formatMoney(value)
      },
      10: 'vrAcumuladoEspecial',
      11: 'vrArrecadado',
      12: {
        key: 'ganhadoresPorUf',
        render: (items) => items.map(item => {
          const data = `,
          {
            "name": "Detalhamento|${item.noCidade} - ${item.sgUf}",
            "value": "${item.qtGanhadores} aposta ganhou o prêmio para 15 acertos"
          }`
          return data
        }).join('\n')
      },
      13: {
        key: 'dt_apuracao',
        render: (value) => moment(value).format('YYYYMMDD000000')
      },
      14: 'nu_concurso',
      15: {
        key: 'de_resultado',
        render: (value) => value.split('-').join(',')
      },
      16: {
        key: 'dtProximoConcurso',
        render: (value) => moment(value).format('YYYYMMDD000000')
      },
      17: 'vrEstimativa'
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
              "count": ${values[3]},
              "amount": "R$${values[7]}"
            },
            {
              "name": "12 acertos",
              "count": ${values[4]},
              "amount": "R$${values[8]}"
            },
            {
              "name": "11 acertos",
              "count": ${values[5]},
              "amount": "R$${values[9]}"
            }
          ]
        }
      ],
      "jackpot": [],
      "other": [
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
      "nextPoolSize": "R$ ${values[17]}"
    }
    `
    try {
      return JSON.parse(result)
    } catch (err) {
      throw new VError(err, `br crawler :${this.lotteryId} parse json result error\n${result}`)
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
