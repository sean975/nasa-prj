const http = require('http')

require('dotenv').config()

const app = require('./app')
const {mongoConnect} = require('./services/mongo')
const {loadsPlanetData} = require('./models/planets.model')
const {loadsLaunchData} = require('./models/launches.model')

const server = http.createServer(app)
const PORT = process.env.PORT || 8000


mongoConnect()
.then(() => loadsPlanetData())
.then(() => loadsLaunchData())
.then(() => {
  server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`)
  })
})
