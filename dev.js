const run = require('./scheduler')

switch (process.argv.length) {
  case 2:
    run()
    break
  case 3:
    run(process.argv[2])
    break
  case 4:
    run(process.argv[2], process.argv[3])
    break
  default:
    throw new Error('invalid arguments')
}
