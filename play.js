// This is a playground, you can try anything here.
const { SiteClosedError } = require('./util/error')

const err = new SiteClosedError('id')
console.log(err)

console.log(err.name === 'SiteClosedError')

throw err
