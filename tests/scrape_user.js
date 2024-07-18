const fetch = require('node-fetch')
const cheerio = require('cheerio')
async function search(ops= { query: "", page: 1 }) {
    // console.log(`https://ollama.com/search?q=${ops.query}&p=${ops.page}`)
 return await   fetch(`https://ollama.com/search?q=${ops.query}&p=${ops.page}`).then(r => r.text()).then((rd) => {
        const $ = cheerio.load(rd)
        let res = []
 $($).children().toArray()