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
  windowMs: 5 * 60 * 1000, // 15 minutes
  max: 10000 // limit each IP to 100 requests per windowMs
})

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
    res.json(apiResonse(200, 'success', myCache.get('models')))
  } else {
    const scrape = require('./scrape')
    let models = await scrape.scrapeModel()
    myCache.set('models', models, 1000)
    res.status(201).send(apiResonse(201, 'success', models))
  }
})

app.get('/api/tags/:tag', async (req, res) => {
  if (myCache.get('models')) {
    res.json(apiResonse(200, 'success', myCache.get('models').find(e => e.name === req.params.tag).tags))
  } else {
    const scrape = require('./scrape')
    let tags = await scrape.scrapeTags(req.params.tag)
    myCache.set(req.params.tag, tags, 1000)
    res.send(apiResonse(201, 'success', tags))
  }
})

app.listen(3000, () => {
  console.log('Server is running on port 3000')
})
