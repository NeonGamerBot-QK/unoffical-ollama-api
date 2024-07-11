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
async function scrapeModel () {
  return new Promise(async (ress, rej) => {
    fetch('https://ollama.ai/library').then(r => r.text()).then(async rd => {
    // console.log(rd)
      const $ = cheerio.load(rd)
      let res = []
      const items = $('li').filter((i, e) => {
        // console.log(i)
        // console.log(e.attributes[0].value)
        return e.attributes[0].value === 'flex items-baseline border-b border-neutral-200 py-6'
      })
    // .each((i,e) => {
      //  const name = e.children[0]
        // console.log(name)
    // })
      for (let i = 0; i < items.length; i++) {
        const htmll = $(items[i]).html()
        const name = htmll.split('<h2 class="truncate text-lg font-medium underline-offset-2 group-hover:underline md:text-2xl">')[1].split('</h2>')[0].split('>')[1].split('<')[0].trim()
        const desc = htmll.split('<p class="max-w-md break-words">')[1].split('</p>')[0].trim()
        const rawLastUpdated = htmll.split('<span class="hidden sm:flex">Updated&nbsp;</span>')[1].split('</span>')[0].trim().split('\n')[0].replace('ago', '').trim()
        let lastUpdated = getSpecialCases(rawLastUpdated) ? new Date(Date.now() - require('ms')(getSpecialCases(rawLastUpdated))) : new Date(Date.now() - require('ms')(rawLastUpdated))
        if (rawLastUpdated.toLowerCase().includes('months')) lastUpdated = new Date(Date.now() - require('ms')(rawLastUpdated.split(/ +/)[0] * 4 + ' weeks'))
        const pulls = htmll.split(`<span class="hidden sm:flex">`)[0].split(`</svg>`)[1].split(`</span>`)[0].trim().split('\n')[0]
        const link = htmll.split(`<a href="`)[1].split('"')[0]
        const tagsCount = htmll.split('<span class="flex items-center">')[2].split('<span class="hidden sm:flex">&nbsp;Tags</span>')[0].split('</svg>')[1].replaceAll('\n', '').trim()
        const tags = await scrapeTags(name)
        res.push({ name, desc, htmll: JSON.parse(JSON.stringify(htmll)), rawLastUpdated, lastUpdated, pulls, html_link: `https://ollama.ai${link}`, tagsCount, tags })
        // res.push({ name, desc, htmll: JSON.parse(JSON.stringify(htmll)), rawLastUpdated, lastUpdated, pulls, tags })
      }
    // console.log(htmll)
    // require('fs').writeFileSync('./models.json', JSON.stringify(res, null, 2))
        // console.log(res[5])
      ress(res)
    })
  })
}
async function scrapeTags (tag_name) {
  return new Promise((ress, rej) => {
    fetch(`https://ollama.com/library/${tag_name}/tags`).then(r => r.text()).then(rd => {
            // console.log(rd)
      const $ = cheerio.load(rd)
      let res = []
      const items = $('div').filter((i, e) => {
                // console.log(i)
                // console.log(e.attributes[0].value)
        return e.attributes[0].value === 'flex px-4 py-3'
      })
            // .each((i,e) => {
              //  const name = e.children[0]
                // console.log(name)
            // })
      for (let i = 0; i < items.length; i++) {
        const htmll = $(items[i]).html()
                // console.log(htmll)
        const name = tag_name + ':' + htmll.split('<div class="break-all font-medium text-gray-900 group-hover:underline">')[1].split('</div>')[0].trim()
        let hash = htmll.split('<span>')[1].split('</span>')[0].split('<span class="font-mono">')[1].trim()
        let [_, size, timestamp] = htmll.split('<span>')[1].split('</span>')[1].trim().split('•').map(e => e.trim())
                // console.log(size, hash, timestamp, name.trim())
        timestamp = timestamp ? timestamp.replace('ago', '').replace('Updated', '').trim() : timestamp
        let ntimestamp = new Date(Date.now() - require('ms')(getSpecialCases(timestamp) ? getSpecialCases(timestamp) : timestamp))
                // console.log(ntimestamp, timestamp)
                // const desc = htmll.split('<p class="mb-4 max-w-md">')[1].split("</p>")[0].trim()
                // const rawLastUpdated = htmll.split('<span class="flex items-center">')[3].split("</span>")[0].trim().split('\n')[1].replace('ago', '').trim()
                // let lastUpdated = new Date(Date.now() - require('ms')(rawLastUpdated))
        if (timestamp.toLowerCase().includes('months')) ntimestamp = new Date(Date.now() - require('ms')(timestamp.split(/ +/)[0] * 4 + ' weeks'))
                // const pulls = htmll.split(`<span class="flex items-center">`)[1].split(`</svg>`)[1].split(`</span>`)[0].trim().split('\n')[1]
        res.push({ name, timestamp: ntimestamp, size, hash })
      }
            // console.log(htmll)
            // require('fs').writeFileSync('./models.json', JSON.stringify(res, null, 2))
            // console.log(res[0])
      ress(res)
    })
  })
}
module.exports = { scrapeModel, scrapeTags, getSpecialCases }
