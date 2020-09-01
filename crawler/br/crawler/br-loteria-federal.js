/**
 * @Author: maple
 * @Date: 2020-08-30 09:05:16
 * @LastEditors: maple
 * @LastEditTime: 2020-09-01 22:06:08
 */
const Crawler = require('./index')
const VError = require('verror')
// const log = require('../../../util/log')
const moment = require('moment')

class BrLoteriaFederal extends Crawler {
  constructor () {
    const config = {
      lotteryID: 'br-loteria-federal'
    }
    super(config)

    this.url = 'http://loterias.caixa.gov.br/wps/portal/loterias/landing/federal/!ut/p/a1/04_Sj9CPykssy0xPLMnMz0vMAfGjzOLNDH0MPAzcDbz8vTxNDRy9_Y2NQ13CDA0MzIAKIoEKnN0dPUzMfQwMDEwsjAw8XZw8XMwtfQ0MPM2I02-AAzgaENIfrh-FqsQ9wBmoxN_FydLAGAgNTKEK8DkRrACPGwpyQyMMMj0VAYe29yM!/dl5/d5/L2dBISEvZ0FBIS9nQSEh/pw/Z7_HGK818G0K0L710QUKB6OH80004/res/id=buscaResultado/c=cacheLevelPage/=/'
  }

  render (data) {
    data = Object.assign(data, data.premios[0])

    const keys = {
      0: {
        key: 'premios',
        render: vs => vs.map(v => `{
          "name": "${parseInt(v.faixa)}º",
          "prize": "R$${v.valor}",
          "lotteryUnit": "${v.noFantasiaCD}",
          "country": "${v.noMunicipioCD}/${v.noSgUfCD}"
        }`).join(',\n')
      },
      1: 'concursoAnterior',
      2: 'concursoAnterior',
      3: 'concursoAnterior',
      4: 'concursoAnterior',
      5: {
        key: 'dataExtracao',
        render: (value) => moment(value, 'DD/MM/YYYY').format('YYYYMMDD000000')
      },
      6: 'concursoAnterior',
      7: {
        key: 'premio1',
        render: value => value.slice(1)
      },
      8: {
        key: 'premio2',
        render: value => value.slice(1)
      },
      9: {
        key: 'premio3',
        render: value => value.slice(1)
      },
      10: {
        key: 'premio4',
        render: value => value.slice(1)
      },
      11: {
        key: 'premio5',
        render: value => value.slice(1)
      }
    }

    const values = this.getValues(data, keys)

    const result = `
    {
      "breakdown": [
        {
          "name": "1º sorteio",
          "detail": [
            ${values[0]}
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
