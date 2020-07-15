const pptr = require('puppeteer')
const { pptrEnv } = require('../config')
let instance = null

// 使用单例模式只用一个浏览器
const getBrowserInstance = async () => {
  if (!instance) {
    // instance = chrome ? await pptr.launch({ headless: true }) : await pptr.launch()
    switch (pptrEnv) {
      case 'docker':
        instance = await pptr.launch({
          executablePath: '/usr/bin/chromium-browser',
          args: ['--no-sandbox', '--headless', '--disable-gpu']
        })
        break
      default:
        instance = await pptr.launch()
        break
    }
  }
  return instance
}
const PuppeteerPage = async () => {
  const browser = await getBrowserInstance() // 使用这种方式并不高效，因为得打开chrome. 生产里面最好还是用connect的方式，这样维护一个打开的chrome，打开页面就可以了。
  const page = await browser.newPage()
  // page.on('console', consoleObj => console.log(consoleObj.text())) // 解决console没反应的问题
  await page.setDefaultNavigationTimeout(0)
  return page
}

module.exports = {
  getBrowserInstance,
  PuppeteerPage
}
