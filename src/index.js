// module.exports
const express = require('express')
const app = express()

const NodeCache = require('node-cache')
const myCache = new NodeCache({
    // stdTTL: 1000 *
  deleteOnExpire: true
})
// setup ratelimits because YK ollama is gonna ratelimit

const rateLimit = require('express-rate-limit')
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 1000 // limit each IP to 100 requests per windowMs
})
app.use(require('cors')({ origin: '*' }))
app.use(require('morgan')('dev'))
app.use(limiter)
app.use(express.json())
function apiResonse (status, message, data) {
  return {
    status: status,
    message: message,
    data: data
  }
}
app.get('/', (req, res) => {
  res.send('Hello World')
})
app.get('/api/models', async (req, res) => {
  if (myCache.get('models')) {
    let models = myCache.get('models')
    if(!req.query.show_htmll) {
      models = models.map(e => {
        delete e['htmll']
        return e;
      })
    }
    res.json(apiResonse(200, 'success', models))
  } else {
    const scrape = require('./scrape')
    let models = await scrape.scrapeModel()
    myCache.set('models', models, 10000)
    if(!req.query.show_htmll) {
      models = models.map(e => {
        delete e['htmll']
        return e;
      })
    } 
    res.status(201).send(apiResonse(201, 'success', models))
  }
})

app.get('/api/tags/:tag', async (req, res) => {
  if (myCache.get('models')) {
    res.json(apiResonse(200, 'success', myCache.get('models').find(e => e.name === req.params.tag)?.tags))
  } else {
    const scrape = require('./scrape')
    let tags = await scrape.scrapeTags(req.params.tag)
    myCache.set(req.params.tag, tags, 1000)
    res.send(apiResonse(201, 'success', tags))
  }
})
app.get('/api/blogs', async (req,res) => {
  if(myCache.get('blogs')) {
    const blogs = myCache.get('blogs')
    res.json(apiResonse(200, 'success', blogs))
  } else {
    const scrape = require('./scrape')
    const blogs = await scrape.scrapeBlogs()
   myCache.set('blogs', blogs)
    res.json(apiResonse(201, 'success', blogs))
  }
})
app.get('/api/blogs/:id', async (req,res) => {
  if(myCache.get('blogs_'+req.params.id)) {
    const blogs = myCache.get('blogs_'+req.params.id)
    res.json(apiResonse(200, 'success', blogs))
  } else {
    const scrape = require('./scrape')
    const blogs = await scrape.scrapeBlogPage(req.params.id)
   myCache.set('blogs_'+req.params.id, blogs)
    res.json(apiResonse(201, 'success', blogs))
  }
})
app.listen(3000, () => {
  console.log('Server is running on port 3000')
})
