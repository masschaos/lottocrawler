const argv = process.argv
const lotteryIdConfig = require('./config/const').lotteryIdConfig
const getCrawler = require('./crawler/au/retry').getCrawler

// console.log(argv.filter((val, idx) => {
//     return idx >= 2
// }))

// if(argv.length < 3){
//     console.log("请传入参数")
//     return
// }

// const lotteryId = argv[2]

// if(lotteryIdConfig.indexOf(lotteryId) < 0){
//     console.log("传入的lotteryId不合法")
//     return
// }
console.log(process.env.LOTTERY_ID)


async function rework () {
    try {
        const crawler = getCrawler(process.env.LOTTERY_ID)
        await new crawler().crawl()
    } catch (error) {
        console.log(error)
    }
}

rework()