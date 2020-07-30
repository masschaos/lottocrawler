async function ignoreUrls (page) {
  await page.setRequestInterception(true)
  const blockedResourceTypes = [
    'image',
    'media',
    'font',
    'texttrack',
    'object',
    'beacon',
    'csp_report',
    'imageset',
    'stylesheet',
    'other'
  ]
  page.on('request', request => {
    if (blockedResourceTypes.includes(request.resourceType())) {
      request.abort()
    } else if (request.resourceType() === 'document' && !request.url().startsWith('https://www.lotterypost.com')) {
      request.abort()
    } else {
      request.continue()
    }
  })
}

module.exports = {
  ignoreUrls
}
