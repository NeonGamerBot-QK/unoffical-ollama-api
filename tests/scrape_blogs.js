const fetch = require('node-fetch')
const cheerio = require('cheerio')
fetch('https://ollama.com/blog').then(r => r.text()).then((rd) => {
  const $ = cheerio.load(rd)
  let res = []

//   const items =  $('a').filter((i,e) => {
//         // console.log(i)
//         // console.log(e.attributes[0].value)
//         return e.attributes[0].value === 'group border-b py-10'
//     }).toArray()
    // console.log(items)
    // console.log(items.after(items.first()).toArray())
    // cheerio did NOT wana work so manual parsing
  const base_html = $.html()
  const items = $('main').children().first().children().toArray()
    // console.log(items)
  for (let i = 0; i < items.length; i++) {
        // console.log(items[i])
        // const htmll = $(items[i]).html()
        // console.log(htmll)
    const link = items[i].attributes.find(e => e.name == 'href').value
    const name = $(items[i]).children().first().text().trim()
    const desc = $($(items[i]).children().get(2)).text().trim()
    const date = new Date($($(items[i]).children().get(1)).text().trim())
    res.push({
      name, desc, date, html_link: `https://ollama.ai${link}`, id: link.replace('/blog/')
    })
  }
})
// example of getting blogs data
fetch('https://ollama.com/blog/gemma2').then(r => r.text()).then((rd) => {
  const $ = cheerio.load(rd)
    // const base_html = $.html()
  const title = $('h1.text-4xl').text().trim()
  const date = new Date($(`h2.text-neutral-500`).text().trim())
  const blog_post_html = $('section').html()
  console.log({title, date, blog_post_html})
})
