/**
 * @Author: maple
 * @Date: 2020-08-30 09:05:16
 * @LastEditors: maple
 * @LastEditTime: 2020-09-01 18:19:13
 */
const Crawler = require('./index')
const VError = require('verror')
// const log = require('../../../util/log')
const moment = require('moment')

class BrTimemania extends Crawler {
  constructor () {
    const config = {
      lotteryId: 'br-mega-sena'
    }
    super(config)

    this.url = 'http://loterias.caixa.gov.br/wps/portal/loterias/landing/timemania/!ut/p/a1/04_Sj9CPykssy0xPLMnMz0vMAfGjzOLNDH0MPAzcDbz8vTxNDRy9_Y2NQ13CDA1MzIEKIoEKnN0dPUzMfQwMDEwsjAw8XZw8XMwtfQ0MPM2I02-AAzgaENIfrh-FqsQ9wBmoxN_FydLAGAgNTKEK8DkRrACPGwpyQyMMMj0VASrq9qk!/dl5/d5/L2dBISEvZ0FBIS9nQSEh/pw/Z7_61L0H0G0JGJVA0AKLR5T3K00M4/res/id=buscaResultado/c=cacheLevelPage/=/'
  }

  render (data) {
    const keys = {
      0: 'qt_GANHADOR_FAIXA_1',
      1: 'qt_GANHADOR_FAIXA_2',
      2: 'qt_GANHADOR_FAIXA_3',
      3: 'qt_GANHADOR_FAIXA_4',
      4: 'qt_GANHADOR_FAIXA_5',
      5: 'qt_GANHADOR_TIME_CORACAO',
      6: {
        key: 'vr_RATEIO_FAIXA_1',
        render: (value) => value === 0 ? 'Acumulado' : `R$${this.formatMoney(value)}`
      },
      7: {
        key: 'vr_RATEIO_FAIXA_2',
        render: (value) => value === 0 ? 'Acumulado' : `R$${this.formatMoney(value)}`
      },
      8: {
        key: 'vr_RATEIO_FAIXA_3',
        render: value => this.formatMoney(value)
      },
      9: {
        key: 'vr_RATEIO_FAIXA_4',
        render: value => this.formatMoney(value)
      },
      10: {
        key: 'vr_RATEIO_FAIXA_5',
        render: value => this.formatMoney(value)
      },
      11: {
        key: 'vr_RATEIO_TIME_CORACAO',
        render: value => this.formatMoney(value)
      },
      12: {
        key: 'vr_ACUMULADO_FAIXA_1',
        render: value => this.formatMoney(value)
      },
      13: {
        key: 'vr_ACUMULADO_PROXIMO_CONCURSO',
        render: value => this.formatMoney(value)
      },
      14: {
        key: 'vr_ARRECADADO',
        render: value => this.formatMoney(value)
      },
      15: {
        key: 'dt_APURACAO',
        render: (value) => moment(value).format('YYYYMMDD200000')
      },
      16: 'nu_CONCURSO',
      17: {
        key: 'resultadoOrdenado',
        render: (value) => value.split('-').join(',')
      },
      18: 'co_TIME_CORACAO',
      19: {
        key: 'dt_PROXIMO_CONCURSO',
        render: (value) => moment(value).format('YYYYMMDD200000')
      },
      20: {
        key: 'vr_ESTIMATIVA_FAIXA_1',
        render: value => this.formatMoney(value)
      },
      21: {
        key: 'timeCoracao',
        render: value => value ? `,{"name":"timeCoracao","value":"${value}"}` : ''
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
        }
        ${values[21]}
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
      throw new VError(err, `br crawler :${this.lotteryId} parse json result error\n${result}`)
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
