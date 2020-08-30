/**
 * @Author: maple
 * @Date: 2020-08-30 09:05:16
 * @LastEditors: maple
 * @LastEditTime: 2020-08-30 15:35:20
 */
const Crawler = require('./index')
const VError = require('verror')
// const log = require('../../../util/log')
const moment = require('moment')

class BrDuplaSena extends Crawler {
  constructor () {
    const config = {
      lotteryId: 'br-mega-sena'
    }
    super(config)

    this.url = 'http://loterias.caixa.gov.br/wps/portal/loterias/landing/duplasena/%7C%E6%98%9F%E6%9C%9F%E4%BA%8C/!ut/p/a1/04_Sj9CPykssy0xPLMnMz0vMAfGjzOLNDH0MPAzcDbwMPI0sDBxNXAOMwrzCjA2cDIAKIoEKnN0dPUzMfQwMDEwsjAw8XZw8XMwtfQ0MPM2I02-AAzgaENLvRYQFRkW-zr7p-lEFiSUZupl5afn6ETXPZsx_Nmf-k109-uH6UahmuAc4mxo4-rs4WRoYA6GBKVQBPk-CFeDxRUFuaESVT1qwZ7qiIgCmNr_R/dl5/d5/L2dBISEvZ0FBIS9nQSEh/pw/Z7_61L0H0G0J0I280A4EP2VJV30N4/res/id=buscaResultado/c=cacheLevelPage/=/'
  }

  render (data) {
    const keys = {
      0: 'ganhadores_sena1',
      4: {
        key: 'valor_sena1',
        render: (value) => value === 0 ? 'Não houve acertador' : `R$${this.formatMoney(value)}`
      },
      1: 'qt_ganhador_quina_faixa1',
      2: 'qt_ganhador_quadra_faixa1',
      3: 'qt_ganhador_terno_faixa1',
      5: {
        key: 'vr_quina_faixa1',
        render: (value) => this.formatMoney(value)
      },
      6: {
        key: 'vr_quadra_faixa1',
        render: (value) => this.formatMoney(value)
      },
      7: {
        key: 'vr_terno_faixa1',
        render: (value) => this.formatMoney(value)
      },
      8: 'ganhadores_sena1',
      12: {
        key: 'valor_sena1',
        render: (value) => value === 0 ? 'Não houve acertador' : `R$${this.formatMoney(value)}`
      },
      9: 'ganhadores_quina2',
      10: 'ganhadores_quadra2',
      11: 'qt_ganhador_terno_faixa2',
      13: {
        key: 'valor_quina2',
        render: (value) => this.formatMoney(value)
      },
      14: {
        key: 'valor_quadra2',
        render: (value) => this.formatMoney(value)
      },
      15: {
        key: 'vr_terno_faixa2',
        render: (value) => this.formatMoney(value)
      },
      16: {
        key: 'valor_acumulado_sena1',
        render: (value) => this.formatMoney(value)
      },
      17: {
        key: 'vr_acumulado_especial',
        render: (value) => this.formatMoney(value)
      },
      18: {
        key: 'vr_arrecadado',
        render: (value) => this.formatMoney(value)
      },
      19: {
        key: 'dtinclusao',
        render: (value) => moment(value).format('YYYYMMDD200000')
      },
      20: 'concurso',
      21: {
        key: 'resultadoOrdenadoSorteio1',
        render: (value) => value.split('-').join(',')
      },
      22: {
        key: 'resultadoOrdenadoSorteio2',
        render: (value) => value.split('-').join(',')
      },
      23: {
        key: 'data_proximo_concurso',
        render: (value) => moment(value).format('YYYYMMDD200000')
      },
      24: {
        key: 'valor_estimativa',
        render: value => this.formatMoney(value)
      }
    }

    const values = this.getValues(data, keys)

    const result = `
    {
      "breakdown": [
        {
          "name": "Premiação - 1º Sorteio",
          "detail": [
            {
              "name": "Sena - 6 números acertados",
              "count": ${values[0]},
              "prize": "${values[4]}"
            },
            {
              "name": "Quina - 5 números acertados",
              "count": ${values[1]},
              "prize": "R$${values[5]}"
            },
            {
              "name": "Quadra - 4 números acertados",
              "count": ${values[2]},
              "prize": "R$${values[6]}"
            },
            {
              "name": "Terno - 3 números acertados",
              "count": ${values[3]},
              "prize": "R$${values[7]}"
            }
          ]
        },
        {
          "name": "Premiação - 2º Sorteio",
          "detail": [
            {
              "name": "Sena - 6 números acertados",
              "count": ${values[8]},
              "prize": "${values[12]}"
            },
            {
              "name": "Quina - 5 números acertados",
              "count": ${values[9]},
              "prize": "R$${values[13]}"
            },
            {
              "name": "Quadra - 4 números acertados",
              "count": ${values[10]},
              "prize": "R$${values[14]}"
            },
            {
              "name": "Terno - 3 números acertados",
              "count": ${values[11]},
              "prize": "R$${values[15]}"
            }
          ]
        }
      ],
      "jackpot": [],
      "other": [
        {
          "name": "Valor acumulado para a faixa Sena 1º Sorteio",
          "value": "R$${values[16]}"
        },
        {
          "name": "Acumulado para Sorteio Especial de Páscoa",
          "value": "R$${values[17]}"
        },
        {
          "name": "Arrecadação total",
          "value": "R$${values[18]}"
        }
      ],
      "drawTime": "${values[19]}",
      "issue": "${values[20]}",
      "numbers": "${values[21]}|${values[22]}",
      "name": "Dupla Sena",
      "lotteryID": "br-dupla-sena",
      "nextDrawTime": "${values[23]}",
      "nextPoolSize": "R$${values[24]}"
    }
    `
    try {
      return JSON.parse(result)
    } catch (err) {
      throw new VError(err, `br crawler :${this.lotteryId} parse json result error\n${result}`)
    }
  }
}

const brDuplaSena = new BrDuplaSena()
// async function main () {
//   // eslint-disable-next-line no-console
//   console.log(require('util').inspect(await brDuplaSena.crawl('2122'), false, null, true))
// }

// main()

module.exports = {
  crawl: brDuplaSena.crawl.bind(brDuplaSena)
}
