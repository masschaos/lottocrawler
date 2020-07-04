const axios = require('axios')
const mappers = require('./mapper')
const cronJob = require('cron').CronJob
const moment = require('moment')
const getJob = require('./job').getJob

axios.get('https://seaapi.lottowawa.com/staging/system/config').then((resp) => {
    if(resp.data && resp.data.countries){
        resp.data.countries.forEach(a => {
            const countryJob = getJob(a.code);
            
            if(countryJob){
                new countryJob().start()
            }
        })
    }
})