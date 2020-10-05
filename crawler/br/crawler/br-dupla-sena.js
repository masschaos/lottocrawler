/**
 * @Author: maple
 * @Date: 2020-08-30 09:05:16
 * @LastEditors: maple
 * @LastEditTime: 2020-09-06 16:17:08
 */
const Crawler = require('./index')
const VError = require('verror')
// const log = require('../../../util/log')
const moment = require('moment')

class BrDuplaSena extends Crawler {
  constructor () {
    const config = {
      lotteryID: 'br-dupla-sena'
    }
    super(config)

    this.url = 'http://loterias.caixa.gov.br/wps/portal/loterias/landing/duplasena/!ut/p/a1/04_Sj9CPykssy0xPLMnMz0vMAfGjzOLNDH0MPAzcDbwMPI0sDBxNXAOMwrzCjA2cDIAKIoEKnN0dPUzMfQwMDEwsjAw8XZw8XMwtfQ0MPM2I02-AAzgaENLvRYQFRkW-zr7p-lEFiSUZupl5afn6ETXPZsx_Nmf-k109-uH6UahmuAc4mxo4-rs4WRoYA6GBKVQBPk-CFeDxRUFuaESVT1qwZ7qiIgCmNr_R/dl5/d5/L2dBISEvZ0FBIS9nQSEh/pw/Z7_61L0H0G0J0I280A4EP2VJV30N4/res/id=buscaResultado/c=cacheLevelPage/=/'
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
        key: 'listaRateioPremio',
        render: (value) => value[4].numeroDeGanhadores
      },
      12: {
        key: 'listaRateioPremio',
        render: (value) => value[4].valorPremio === 0 ? 'Não houve acertador' : `R$${this.formatMoney(value[0].valorPremio)}`
      },
      9: {
        key: 'listaRateioPremio',
        render: (value) => value[5].numeroDeGanhadores
      },
      10: {
        key: 'listaRateioPremio',
        render: (value) => value[6].numeroDeGanhadores
      },
      11: {
        key: 'listaRateioPremio',
        render: (value) => value[7].numeroDeGanhadores
      },
      13: {
        key: 'listaRateioPremio',
        render: (value) => this.formatMoney(value[5].valorPremio)
      },
      14: {
        key: 'listaRateioPremio',
        render: (value) => this.formatMoney(value[6].valorPremio)
      },
      15: {
        key: 'listaRateioPremio',
        render: (value) => this.formatMoney(value[7].valorPremio)
      },
      16: {
        key: 'valorAcumuladoProximoConcurso',
        render: (value) => this.formatMoney(value)
      },
      17: {
        key: 'valorAcumuladoConcursoEspecial',
        render: (value) => this.formatMoney(value)
      },
      18: {
        key: 'valorArrecadado',
        render: (value) => this.formatMoney(value)
      },
      19: {
        key: 'dataApuracao',
        render: (value) => moment(value, 'DD/MM/YYYY').format('YYYYMMDD200000')
      },
      20: 'numero',
      21: {
        key: 'listaDezenas',
        render: (value) => value.map(item => item.slice(1)).join(',')
      },
      22: {
        key: 'listaDezenasSegundoSorteio',
        render: (value) => value.map(item => item.slice(1)).join(',')
      },
      23: {
        key: 'dataProximoConcurso',
        render: (value) => moment(value, 'DD/MM/YYYY').format('YYYYMMDD200000')
      },
      24: {
        key: 'valorEstimadoProximoConcurso',
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
      throw new VError(err, `br crawler :${this.lotteryID} parse json result error\n${result}`)
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
