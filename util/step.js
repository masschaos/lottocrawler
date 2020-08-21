// 根据步数定义，算出当前id执行结束后还剩几步
function stepLeft (steps, id) {
  return steps.length - steps.findIndex(x => x.id === id) - 1
}

module.exports = {
  stepLeft
}
