const parseDict = { 'pe-gana-diario': parseGana, 'pe-kabala': parseKabala, 'pe-tinka': parseTinka }

async function parse (page, data) {
  try {
    const result = await parseDict[data.lotteryID](page, data)
    delete result.detailUrl
    delete result.time
    delete result.indexPagePath
    return { data: result, error: null }
  } catch (err) {
    return { data: [], error: err }
  }
}

async function parseGana (page, data) {
  const result = await page.evaluate((data) => {
    data.numbers = document.querySelector('.numeros-gr-esc').innerText.split(' ').join(',')
    data.drawTime = document.querySelector('#listaResultados h2 a').href.split('=')[1].split('-').join('') + data.time
    data.detailUrl = document.querySelector('#listaResultados h2 a').href
    data.issue = document.querySelector('#listaResultados > h2:nth-child(2) > a').innerText.split(' ')[2]
    data.jackpot = [document.querySelector('#listaResultados > table > tbody > tr > td.info.res.text-right').innerText]
    return data
  }, data)

  await page.goto(result.detailUrl)
  const detail = await page.evaluate(() => {
    const [, lines1] = Array.from(document.querySelectorAll('.table-bordered'))
    const lines = Array.from(lines1.querySelectorAll('tbody tr'))
    return lines.map(line => {
      const [name, count, average, prize] = Array.from(line.querySelectorAll('td')).map(item => item.textContent)
      return { name, count: parseInt(count.split(',').join('')), average, prize }
    })
  })
  result.breakdown = [{ name: 'main', detail }]
  return result
}

async function parseKabala (page, data) {
  const result = await page.evaluate((data) => {
    const numberList = Array.from(document.querySelectorAll('.numeros-gr-esc')).slice(0, 2)
    data.numbers = numberList.map(item => [...item.querySelectorAll('.label-numero')].map(each => each.textContent).join(',')).join('|')
    data.drawTime = document.querySelector('#listaResultados h2 a').href.split('=')[1].split('-').join('') + data.time
    data.detailUrl = document.querySelector('#listaResultados h2 a').href
    data.jackpot = [document.querySelector('#listaResultados > table > tbody > tr > td.info.res.text-right').innerText]
    return data
  }, data)
  await page.goto(result.detailUrl)
  const breakdown = await page.evaluate(() => {
    const [, lines1, lines2] = Array.from(document.querySelectorAll('.table-bordered'))
    const line1 = Array.from(lines1.querySelectorAll('tbody tr'))
    const line2 = Array.from(lines2.querySelectorAll('tbody tr'))
    const breakdownData = [{ name: 'Premios de Kabala del', detail: [] }, { name: 'Premios de Chau Chamba del', detail: [] }]
    breakdownData[0].detail = line1.map(line => {
      const [name, count, average, prize] = Array.from(line.querySelectorAll('td')).map(item => item.textContent)
      return { name, count: parseInt(count.split(',').join('')), average, prize }
    })
    breakdownData[1].detail = line2.map(line => {
      const [name, count, average, prize] = Array.from(line.querySelectorAll('td')).map(item => item.textContent)
      return { name, count: parseInt(count.split(',').join('')), average, prize }
    })
    return breakdownData
  })
  result.breakdown = breakdown
  return result
}

async function parseTinka (page, data) {
  const result = await page.evaluate((data) => {
    data.numbers = document.querySelector('.numeros-gr-esc').innerText.split(' ').join(',').replace(',Boliyapa', '#')
    data.drawTime = document.querySelector('#listaResultados h2 a').href.split('=')[1].split('-').join('') + data.time
    data.detailUrl = document.querySelector('#listaResultados h2 a').href
    data.jackpot = [document.querySelector('#listaResultados > table > tbody > tr > td.info.res.text-right').innerText]
    return data
  }, data)

  await page.goto(result.detailUrl)
  const detail = await page.evaluate(() => {
    const [, lines1] = Array.from(document.querySelectorAll('.table-bordered'))
    const lines = Array.from(lines1.querySelectorAll('tbody tr'))
    return lines.map(line => {
      const [name, count, average, prize] = Array.from(line.querySelectorAll('td')).map(item => item.textContent)
      return { name, count: parseInt(count.split(',').join('')), average, prize }
    })
  })
  result.breakdown = [{ name: 'main', detail }]
  return result
}

module.exports = {
  parse
}
