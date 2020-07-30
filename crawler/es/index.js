
// 本代码通过createFile.js脚本自动生成。
const crawlers = new Map()

crawlers.set('es-euromillions', [require('./primary/es-euromillions')])
crawlers.set('es-el-gordo', [require('./primary/es-el-gordo')])
crawlers.set('es-bonoloto', [require('./primary/es-bonoloto')])
crawlers.set('es-la-primitiva', [require('./primary/es-la-primitiva')])

module.exports = crawlers
