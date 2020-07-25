const run = require('./scheduler')
const { restTime } = require('./config')
const im = require('./util/im')
const log = require('./util/log')
const { sleep } = require('./util/time')

im.info('服务端重新启动')

let go = true

process.on('SIGTERM', () => {
  im.info('服务端收到停止信号，完成剩余任务中')
  go = false
})

;(async () => {
  // eslint-disable-next-line no-unmodified-loop-condition
  while (go) {
    await run()
    if (go) {
      sleep(1000 * restTime)
      log.info('一个循环运行结束，开始下个循环')
    }
  }
  im.info('服务端安全退出')
  process.exit()
})()
