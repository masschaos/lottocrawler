const run = require('./scheduler')
const { restTime } = require('./config')
const im = require('./util/im')
const { sleep } = require('./util/time')

im.info('服务端重新启动')

let go = true

process.on('SIGINT', () => {
  im.info('服务端收到停止信号，完成剩余任务中')
  go = false
})

;(async () => {
  // eslint-disable-next-line no-unmodified-loop-condition
  while (go) {
    await run()
    im.info('一个循环运行结束，等待开始下个循环')
    if (go) {
      sleep(1000 * restTime)
    }
  }
  im.info('服务端安全退出')
  process.exit()
})()
