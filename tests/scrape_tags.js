const fetch = require('node-fetch')
const cheerio = require('cheerio')
const tag_name = 'gemma'

fetch('https://ollama.com/library/gemma/tags').then(r => r.text()).then(rd => {
    // console.log(rd)
    const $ = cheerio.load(rd)
    let res = []
  const items =  $('div').filter((i,e) => {
        // console.log(i)
        // console.log(e.attributes[0].value)
        return e.attributes[0].value === 'flex px-4 py-3'
    })
    //.each((i,e) => {
      //  const name = e.children[0]
        //console.log(name)
    //})
    for (let i = 0; i < items.length; i++) {
        const htmll = $(items[i]).html()
        console.log(htmll)
        const name = tag_name + ':' + htmll.split('<div class="break-all font-medium text-gray-900 group-hover:underline">')[1].split("</div>")[0].trim()
        let hash = htmll.split('<span>')[1].split("</span>")[0].split('<span class="font-mono">')[1].trim()
        let [_, size, timestamp] = htmll.split('<span>')[1].split("</span>")[1].trim().split('•').map(e => e.trim())
        console.log(size, hash, timestamp, name.trim())
        timestamp = timestamp ? timestamp.replace('ago', '').replace('Updated', '').trim() : timestamp
        let ntimestamp = new Date(Date.now() - require('ms')(timestamp))
        // console.log(ntimestamp, timestamp)
        // const desc = htmll.split('<p class="mb-4 max-w-md">')[1].split("</p>")[0].trim()
        // const rawLastUpdated = htmll.split('<span class="flex items-center">')[3].split("</span>")[0].trim().split('\n')[1].replace('ago', '').trim()
        // let lastUpdated = new Date(Date.now() - require('ms')(rawLastUpdated))
        if(timestamp.toLowerCase().includes('months')) ntimestamp = new Date(Date.now() - require('ms')(timestamp.split(/ +/)[0] * 4 + ' weeks'))
        // const pulls = htmll.split(`<span class="flex items-center">`)[1].split(`</svg>`)[1].split(`</span>`)[0].trim().split('\n')[1]
        res.push({ name, timestamp: ntimestamp, size, hash })
    }
    // console.log(htmll)
    // require('fs').writeFileSync('./models.json', JSON.stringify(res, null, 2))
    // console.log(res[0])
})