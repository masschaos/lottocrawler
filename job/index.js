const fs = require('fs')

const auJobClass = require('./au')

let classMap = new Map()
classMap.set("au", auJobClass)

function getJob(countryCode){
    if(classMap.has(countryCode)){
        return classMap.get(countryCode)
    }
    return null
}

module.exports = {
    getJob
}