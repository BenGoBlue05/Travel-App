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

let tripMap = new Map()
app.listen(port, () => console.log(`listening on port ${port}`))

app.get('/', (_, res) => res.sendFile('dist/index.html'))

app.get('/api/weatherbitKey', (_, res) => {
    res.status(200).send({key: process.env.WEATHERBIT_API_KEY})
})

app.get('/api/pixabayKey', (_, res) => {
    res.status(200).send({key: process.env.PIXABAY_API_KEY})
})

app.post('/api/add', (req, res) => {
    const body = req.body
    const id = `${body.date}|${body.name}`
    body.id = id
    tripMap.set(id, body)
    res.status(201).send({})
})

app.get('/api/trips', (_, res) => {
    let trips = []
    for (const trip of tripMap.values()) {
        trips.push(trip)
    }
    trips.sort((trip1, trip2) => sortTripsByDate(trip1, trip2))
    res.status(200).send({trips: trips})
})

app.delete('/api/trip', (req, res) => {
    const id = req.body.id
    const deleted = tripMap.delete(id)
    if (deleted) {
        res.status(200).send({})
    } else {
        res.status(404).send({error: `Trip ID ${id} not found`})
    }
})

function dateToMillis(date = '2021-08-25') {
    const year = parseInt(date.slice(0, 4))
    const month = parseInt(date.slice(5, 7))
    const day = parseInt(date.slice(8, 10))
    const res = new Date()
    res.setFullYear(year, month - 1, day)
    return res.getTime()
}

function sortTripsByDate(trip1 = {}, trip2 = {}) {
    return dateToMillis(trip1.id) - dateToMillis(trip2.id)
}



