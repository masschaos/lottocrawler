const argv = process.argv
const crawler = require("./crawler/au/history/tattsLottoCrawler")

console.log(argv.filter((val, idx) => {
    return idx >= 2
}))

const c = new crawler("au-tattslotto")
c.crawl()