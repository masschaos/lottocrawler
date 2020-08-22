// const fs = require('fs')
// const util = require('util')
// const path = require('path')
// const log = require('../util/log')

// const basePath = path.resolve('../crawler')
// const readdir = util.promisify(fs.readdir)
// const stat = util.promisify(fs.stat)

// async function getFiles (base) {
//   const jsFiles = new Set()

//   const files = await readdir(base)
//   const filePaths = files.map(file => path.join(base, file))

//   for (const p of filePaths) {
//     const state = await stat(p)
//     if (state.isDirectory()) {
//       const jsNewFiles = await getFiles(p)
//       for (const f of jsNewFiles) {
//         jsFiles.add(f)
//       }
//       continue
//     }

//     if (path.parse(p).ext === '.js') {
//       jsFiles.add(p)
//     }
//   }

//   return jsFiles
// }

// async function main () {
//   const files = await getFiles(basePath)
//   let m = 0
//   for (const file of files) {
//     try {
//       require(file)
//     } catch (err) {
//       log.debug = function () {}
//       log.info = function () {}
//       const text = fs.readFileSync(file)
//       if (err.message.indexOf('log') > -1 && text.indexOf('const log') > -1) {
//         console.log(`${m++}\n`, file, `const log = require('${'../'.repeat(file.split('/').length - 8)}util/log')`, err.message)
//       } else {
//         console.log(`${m++}\n`, file, err.message)
//       }
//     }
//   }

//   process.nextTick(() => {
//     process.exit(0)
//   })
// }

// main()
