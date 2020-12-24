const dotenv = require('dotenv')
dotenv.config()
const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const app = express()

app.use(cors())
app.use(bodyParser.json())
// to use url encoded values
app.use(bodyParser.urlencoded({
    extended: true
}))

app.use(express.static('dist'))

const port = 3000

app.listen(port, () => console.log(`listening on port ${port}`))

app.get('/', (_, res) => res.sendFile('dist/index.html'))

app.get('/api/weatherbitKey', (_, res) => {
    res.status(200).send({key: process.env.WEATHERBIT_API_KEY})
})

app.get('/api/pixabayKey', (_, res) => {
    res.status(200).send({key: process.env.PIXABAY_API_KEY})
})



