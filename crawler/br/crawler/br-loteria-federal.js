/**
 * @Author: maple
 * @Date: 2020-08-30 09:05:16
 * @LastEditors: maple
 * @LastEditTime: 2020-09-06 10:34:18
 */
const Crawler = require('./index')
const VError = require('verror')
// const log = require('../../../util/log')
const moment = require('moment')
const { DrawingError } = require('../../../util/error')

class BrLoteriaFederal extends Crawler {
  constructor () {
    const config = {
      lotteryID: 'br-loteria-federal'
    }
    super(config)

    this.url = 'http://loterias.caixa.gov.br/wps/portal/loterias/landing/federal/!ut/p/a1/04_Sj9CPykssy0xPLMnMz0vMAfGjzOLNDH0MPAzcDbz8vTxNDRy9_Y2NQ13CDA0MzIAKIoEKnN0dPUzMfQwMDEwsjAw8XZw8XMwtfQ0MPM2I02-AAzgaENIfrh-FqsQ9wBmoxN_FydLAGAgNTKEK8DkRrACPGwpyQyMMMj0VAYe29yM!/dl5/d5/L2dBISEvZ0FBIS9nQSEh/pw/Z7_HGK818G0K0L710QUKB6OH80004/res/id=buscaResultado/c=cacheLevelPage/=/'
  }

  render (data) {
    if (!data.listaMunicipioUFGanhadores || !Array.isArray(data.listaMunicipioUFGanhadores)) {
      throw new DrawingError('drawing error; premios is not array!')
    }

    data = Object.assign(data, data.listaMunicipioUFGanhadores[0])
    function compare (p) {
      return function (m, n) {
        return m[p] - n[p]
      }
    }
    const keys = {
      0: {
        key: 'listaMunicipioUFGanhadores',
        render: vs => vs.sort(compare('posicao')).map(v => { return { name: parseInt(v.posicao) + 'º', lotteryUnit: v.nomeFatansiaUL.trim(), country: `${v.municipio}/${v.uf}` } })
      },
      1: {

        key: 'listaRateioPremio',
        render: vs => vs.map(item => item.valorPremio)
      },
      2: 'concursoAnterior',
      3: 'concursoAnterior',
      4: 'concursoAnterior',
      5: {
        key: 'dataApuracao',
        render: (value) => moment(value, 'DD/MM/YYYY').format('YYYYMMDD000000')
      },
      6: 'numero',
      7: {
        key: 'listaDezenas',
        render: value => value[0].slice(1)
      },
      8: {
        key: 'listaDezenas',
        render: value => value[1].slice(1)
      },
      9: {
        key: 'listaDezenas',
        render: value => value[2].slice(1)
      },
      10: {
        key: 'listaDezenas',
        render: value => value[3].slice(1)
      },
      11: {
        key: 'listaDezenas',
        render: value => value[4].slice(1)
      }
    }

    const values = this.getValues(data, keys)
    const result = `
    {
      "breakdown": [
        {
          "name": "1º sorteio",
          "detail": [
            ${JSON.stringify(values[0].map((item, index) => { return { ...item, prize: this.formatMoney(values[1][index]) } }))}
          ]
        }],
      "jackpot": [],
      "other": [],
      "drawTime": "${values[5]}",
      "issue": "${values[6]}",
      "numbers": "${values[7]}|${values[8]}|${values[9]}|${values[10]}|${values[11]}",
      "name": "Loteria Federal",
      "lotteryID": "br-loteria-federal"
    }
    `
    try {
      return JSON.parse(result)
    } catch (err) {
      throw new VError(err, `br crawler :${this.lotteryID} parse json result error\n${result}`)
    }
  }
}

const brLoteriaFederal = new BrLoteriaFederal()

// async function main () {
//   // eslint-disable-next-line no-console
//   console.log(require('util').inspect(await brLoteriaFederal.crawl('05485'), false, null, true))
// }

// main()

module.exports = {
  crawl: brLoteriaFederal.crawl.bind(brLoteriaFederal)
}
