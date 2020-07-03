const puppeteer = require('puppeteer')

async function crawl (url, parseFunction) {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  try {
    // Goto result page
    await page.goto(url)

    // View prize divisions
    const viewDivisionsSelector = '#content > div.resultsOuter.full.fluid > div > span > a'
    await page.waitForSelector(viewDivisionsSelector)
    await page.click(viewDivisionsSelector)

    // Display balls in drawn order
    const ballOrderSelector = '#ballOrderButton'
    await page.waitForSelector(ballOrderSelector)
    await page.click(ballOrderSelector)

    const result = await parseFunction(page)
    return result
  } catch (error) {
    console.log(error)
    return null
  } finally {
    await browser.close()
  }
}

module.exports.crawl = crawl
