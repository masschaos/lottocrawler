class logger {
    static info(msg){
        console.log(`info: ${msg}`)
    }
    static debug(msg){
        console.log(`debug: ${msg}`)
    }
    static error(msg){
        console.log(`error: ${msg}`)
    }
}

module.exports = logger