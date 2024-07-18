// more todo since theres more then one, model, vision, embedding
const fetch = require('node-fetch')
const cheerio = require('cheerio')
function getSpecialCases (w) {
    switch (w) {
      case 'yesterday':
        return '24h'
        break
      default:
        return false
    }
  }
async function search(ops= { query: "", page: 1 }) {
    // console.log(`https://ollama.com/search?q=${ops.query}&p=${ops.page}`)
 return await   fetch(`https://ollama.com/search?q=${ops.query}&p=${ops.page}`).then(r => r.text()).then((rd) => {
        const $ = cheerio.load(rd)
        let res = []
        const items = $('li').filter((i, e) => {
            // console.log(i)
            // console.log(e.attributes[0].value)
            return e.attributes[0]?.value === 'flex items-baseline border-b border-neutral-200 py-6'
          })
        // .each((i,e) => {
          //  const name = e.children[0]
            // console.log(name)
        // })
          for (let i = 0; i < items.length; i++) {
            const htmll = $(items[i]).html()
console.log(htmll)
            const name = htmll.split('<h2 class="flex items-center mb-3 truncate text-lg font-medium underline-offset-2 group-hover:underline md:text-2xl">')[1].split('</span<')[0].split('<span>')[1].split('\n')[1].trim()
            // console.log(name)
            // .split('>')[1].split('<')[0].trim()
            const isDesc = Boolean(htmll.split('<p class="max-w-md break-words">')[1]) 
            // const desc = 
            const rawLastUpdated = htmll.split('<span class="hidden sm:flex">Updated&nbsp;</span>')[1].split('</span>')[0].trim().split('\n')[0].replace('ago', '').trim()
            let lastUpdated = getSpecialCases(rawLastUpdated) ? new Date(Date.now() - require('ms')(getSpecialCases(rawLastUpdated))) : new Date(Date.now() - require('ms')(rawLastUpdated))
            if (rawLastUpdated.toLowerCase().includes('months')) lastUpdated = new Date(Date.now() - require('ms')(rawLastUpdated.split(/ +/)[0] * 4 + ' weeks'))
            const pulls = htmll.split(`<span class="hidden sm:flex">`)[0].split(`</svg>`)[1].split(`</span>`)[0].trim().split('\n')[0]
            const link = htmll.split(`<a href="`)[1].split('"')[0]
            let tagsCount;
try {
tagsCount    = htmll.split('<span class="flex items-center">')[2].split('<span class="hidden sm:flex">&nbsp;Tags</span>')[0].split('</svg>')[1].replaceAll('\n', '').split('<span')[0].trim()
}             catch (e) {
    tagsCount = null;
}
            // const tags = await scrapeTags(name)
            res.push({ name, desc: isDesc ? htmll.split('<p class="max-w-md break-words">')[1].split('</p>')[0].trim() : null, htmll: JSON.parse(JSON.stringify(htmll)), rawLastUpdated, lastUpdated, pulls, html_link: `https://ollama.ai${link}`, tagsCount })
        //    console.log(res)
            // res.push({ name, desc, htmll: JSON.parse(JSON.stringify(htmll)), rawLastUpdated, lastUpdated, pulls, tags })
          }
      return res;
      })
}
search({ query: 'test', page: 1}).then(d => {
    console.log(d)
    d.forEach((dd) => {
        delete dd['htmll']
        console.log(dd)
    })
})