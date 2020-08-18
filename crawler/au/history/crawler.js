const axios = require('axios')
const lotteryIdProductCodeConfig = require('../../../config/const').lotteryIdProductCodeConfig
const { sleep } = require('../../../util/time')
const fs = require('fs')
const path = require('path')
// const { max } = require('moment')

class crawler {
  constructor (lottoryId) {
    this.lottoryId = lottoryId
  }

  parse (data) {

  }

  async crawl () {
    try {
      const filePath = path.join(__dirname, '../../../data/au', this.lottoryId + '.json')
      // if(fs.existsSync(filePath)){
      //     fs.unlinkSync(filePath)
      // }
      fs.writeFileSync(filePath, '')
      this.ws = fs.createWriteStream(filePath, { encoding: 'utf-8' })

      const drawNo = await this.getDrawNo() // 4065//await this.getDrawNo()

      console.log(drawNo)
      const finalDrawNo = 1
      await this.ws.write('[')
      if (drawNo != null) {
        for (let i = drawNo; i >= finalDrawNo; i -= 50) {
          const result = []
          const maxDrawNo = i
          const minDrawNo = i - 50 < 0 ? 1 : i - 50
          const draws = await this.getDrawRange(minDrawNo, maxDrawNo)

          console.log(`drawNo: ${drawNo}, finalDrawNo: ${finalDrawNo}, minDrawNo: ${minDrawNo}, maxDrawNo: ${maxDrawNo}`)
          // console.log(draws.map(a => a.DrawNumber))
          const percent = parseInt(((maxDrawNo.toString() === drawNo.toString()) ? (drawNo - minDrawNo) / (drawNo - finalDrawNo) : (drawNo - minDrawNo - 1) / (drawNo - finalDrawNo)) * 100)
          console.log(`${percent > 100 ? 100 : percent}%`)
          if (draws != null) {
            draws.forEach(draw => {
              const item = this.parse(draw)
              result.push(item)
            })
            const json = JSON.stringify(result)
            await this.ws.write((maxDrawNo.toString() === drawNo.toString() ? '' : ',') + json.substring(1, json.length - 1))
          }
          i--
          sleep(3000)
        }
      }
    } catch (err) {
      console.log(err)
    } finally {
      await this.ws.write(']')
      this.ws.close()
    }
  }

  async getDrawRange (minDrawNo, maxDrawNo) {
    const url = 'https://data.api.thelott.com/sales/vmax/web/data/lotto/results/search/drawrange'
    const resp = await axios.post(url, {
      MinDrawNo: minDrawNo,
      MaxDrawNo: maxDrawNo,
      Product: lotteryIdProductCodeConfig[this.lottoryId],
      CompanyFilter: [
        'NTLotteries'
      ]
    })
    if (resp.data && resp.data.Draws && resp.data.Draws.length > 0) {
      return resp.data.Draws
    }
    return null
  }

  async getDrawNo () {
    const url = 'https://data.api.thelott.com/sales/vmax/web/data/lotto/latestresults'
    const resp = await axios.post(url, {
      CompanyId: 'NTLotteries',
      MaxDrawCountPerProduct: 1,
      OptionalProductFilter: [lotteryIdProductCodeConfig[this.lottoryId]]
    })

    if (resp.data.DrawResults && resp.data.DrawResults.length > 0) {
      return resp.data.DrawResults[0].DrawNumber
    }
    return null
  }
}

module.exports = crawler
