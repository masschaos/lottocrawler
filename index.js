const axios = require('axios')
const getJob = require('./job').getJob

axios.get(process.env.BASE_URL + '/system/config').then((resp) => {
    if (resp.data && resp.data.countries) {
        resp.data.countries.forEach(a => {
            const countryJob = getJob(a.code);

            if (countryJob) {
                new countryJob().start()
            }
        })
    }
}).catch(err => {
    console.log(err)
})