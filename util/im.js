const im = require('@masschaos/im')
const { config: { im: { token, debugChannel, infoChannel, errorChannel } } } = require('../config')

im.setToken(token)
im.setChannels(debugChannel, infoChannel, errorChannel)

module.exports = im
