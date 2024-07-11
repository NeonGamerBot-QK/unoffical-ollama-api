// using node fetch and cheerio i grant 
// let json = []
const fetch = require('node-fetch')
const cheerio = require('cheerio')
function getSpecialCases(w) {
switch (w) {
  case "yesterday":
  return "24h"
  break;
  default:
    return false;
}
}
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
    for (let i = 0; i < 1; i++) {
        const htmll = $(items[i]).html()
        console.log(htmll)
        const name = htmll.split('<h2 class="truncate text-lg font-medium underline-offset-2 group-hover:underline md:text-2xl">')[1].split("</h2>")[0].split('>')[1].split('<')[0].trim()
        const desc = htmll.split('<p class="max-w-md break-words">')[1].split("</p>")[0].trim()
        const rawLastUpdated = htmll.split('<span class="hidden sm:flex">Updated&nbsp;</span>')[1].split("</span>")[0].trim().split('\n')[0].replace('ago', '').trim()
        let lastUpdated = getSpecialCases(rawLastUpdated) ? new Date(Date.now() - require('ms')(getSpecialCases(rawLastUpdated))) :new Date(Date.now() - require('ms')(rawLastUpdated))
        if(rawLastUpdated.toLowerCase().includes('months')) lastUpdated = new Date(Date.now() - require('ms')(rawLastUpdated.split(/ +/)[0] * 4 + ' weeks'))
        const pulls = htmll.split(`<span class="hidden sm:flex">`)[0].split(`</svg>`)[1].split(`</span>`)[0].trim().split('\n')[0]
      const link = htmll.split(`<a href="`)[1].split('"')[0]
      const tags =   htmll.split('<span class="flex items-center">')[2].split('<span class="hidden sm:flex">&nbsp;Tags</span>')[0].split('</svg>')[1].replaceAll('\n', '').trim()
      res.push({ name, desc, htmll: JSON.parse(JSON.stringify(htmll)), rawLastUpdated, lastUpdated, pulls, html_link: `https://ollama.ai${link}`, tags })
        
        console.log(res)
    }
    // console.log(htmll)
    // require('fs').writeFileSync('./models.json', JSON.stringify(res, null, 2))
    // console.log(res[5])
})