// using node fetch and cheerio i grant 
// let json = []
const fetch = require('node-fetch')
const cheerio = require('cheerio')
// const $ = cheerio.load('<h2 class="title">Hello world</h2>')
fetch('https://ollama.ai/library').then(r => r.text()).then(rd => {
    // console.log(rd)
    const $ = cheerio.load(rd)
    let res = []
  const items =  $('li').filter((i,e) => {
        // console.log(i)
        // console.log(e.attributes[0].value)
        return e.attributes[0].value === 'flex items-baseline border-b border-neutral-200 py-6'
    })
    //.each((i,e) => {
      //  const name = e.children[0]
        //console.log(name)
    //})
    for (let i = 0; i < items.length; i++) {
        const htmll = $(items[i]).html()
        const name = htmll.split('<h2 class="mb-3 truncate text-lg font-medium underline-offset-2 group-hover:underline md:text-2xl">')[1].split("</h2>")[0].trim()
        const desc = htmll.split('<p class="mb-4 max-w-md">')[1].split("</p>")[0].trim()
        const rawLastUpdated = htmll.split('<span class="flex items-center">')[3].split("</span>")[0].trim().split('\n')[1].replace('ago', '').trim()
        let lastUpdated = new Date(Date.now() - require('ms')(rawLastUpdated))
        if(rawLastUpdated.toLowerCase().includes('months')) lastUpdated = new Date(Date.now() - require('ms')(rawLastUpdated.split(/ +/)[0] * 4 + ' weeks'))
        const pulls = htmll.split(`<span class="flex items-center">`)[1].split(`</svg>`)[1].split(`</span>`)[0].trim().split('\n')[1]
        res.push({ name, desc, htmll: JSON.parse(JSON.stringify(htmll)), rawLastUpdated, lastUpdated, pulls })
    }
    // console.log(htmll)
    // require('fs').writeFileSync('./models.json', JSON.stringify(res, null, 2))
    console.log(res[5])
})