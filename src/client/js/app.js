import {WeatherInfo} from "./vo";
import {GeoProfile} from "./vo";
import {PlaceInfo} from "./vo";
import {TripInfo} from "./vo";

let weatherBitApiKey = ''
let pixabayApiKey = ''

const US_COUNTRY_ID = '6252001'

const DAY_IN_MILLIS = 1000 * 60 * 60 * 24

const KEY_PIXABAY = 'pixabayKey'

const KEY_WEATHERBIT = 'weatherBitKey'

async function fetchData(url = '') {
    return fetch(url).then(data => data.json())
}

async function postData(url = '', body = {}) {
    const request = {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    }
    return fetch(url, request).then(data => data.json())
}

async function deleteData(url = '', body = {}) {
    const request = {
        method: 'DELETE',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    }
    return fetch(url, request).then(data => data.json())
}

async function fetchWeatherBitApiKey() {
    // set to cached key first in case request for api key fails
    weatherBitApiKey = localStorage.getItem(KEY_WEATHERBIT)
    fetchData('/api/weatherbitKey')
        .then(data => {
            // save updated key to local storage
            localStorage.setItem(KEY_WEATHERBIT, data.key)
            weatherBitApiKey = data.key
        })
        .catch(e => console.log('Error:', e))
}

async function fetchPixabayApiKey() {
    // set to cached key first in case request for api key fails
    pixabayApiKey = localStorage.getItem(KEY_PIXABAY)
    fetchData('/api/pixabayKey')
        .then(data => {
            // save updated key to local storage
            localStorage.setItem(KEY_PIXABAY, data.key)
            pixabayApiKey = data.key
        })
        .catch(e => console.log('Error:', e))
}

async function fetchGeoProfile(name = '') {
    const url = `http://api.geonames.org/searchJSON?q=${name}&username=benlewis05&maxRows=1`
    return fetchData(url).then(data => GeoProfile.from(data.geonames[0]))
}

async function fetchTypicalWeather(lat = 0.0, lng = 0.0, date = '01-01') {
    const baseUrl = 'https://api.weatherbit.io/v2.0/normals'
    const url = `${baseUrl}?lat=${lat}&lon=${lng}&start_day=${date}&end_day=${date}&units=I&key=${weatherBitApiKey}`
    return fetchData(url).then(data => new WeatherInfo(data.data[0].temp))
}

async function fetchWeatherForecast(lat = 0.0, lng = 0.0, date = '') {
    const url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${lat}&lon=${lng}&units=I&key=${weatherBitApiKey}`
    return fetchData(url).then(data => {
        for (const forecast of data.data) {
            if (forecast.datetime === date) {
                return new WeatherInfo(forecast.temp, 'forecast')
            }
        }
        throw 'Date not found'
    })
}

async function fetchWeather(lat = 0.0, lng = 0.0, date = '') {
    const dateInMillis = dateToMillis(date)
    const duration = dateInMillis - new Date().getTime()
    const tenDays = DAY_IN_MILLIS * 10
    if (duration < tenDays) {
        return fetchWeatherForecast(lat, lng, date)
    } else {
        return fetchTypicalWeather(lat, lng, date.slice(5))
    }
}

async function fetchPlaceInfo(destination = '', date = '') {
    return fetchGeoProfile(destination).then(data => placeInfo(data, date))
}

async function placeInfo(geoProfile = GeoProfile.prototype, date = '') {
    return fetchWeather(geoProfile.lat, geoProfile.lng, date)
        .then(data => new PlaceInfo(geoProfile, data))
}

async function fetchImageUrl(query = '') {
    const url = `https://pixabay.com/api/?q=${query}&key=${pixabayApiKey}`
    return fetchData(url)
        .then(data => data.hits[0].webformatURL)
}

async function fetchTripInfo(destination = '', date = '') {
    return Promise.all([fetchPlaceInfo(destination, date), fetchImageUrl(destination)])
        .then(results => {
            const placeInfo = results[0]
            const imgUrl = results[1]
            return new TripInfo(destination, date, placeInfo.weatherInfo, placeInfo.geoProfile, imgUrl)
        })
}

const resultDiv = document.getElementById('result')

export function formattedTemp(weather = WeatherInfo.prototype) {
    const temp = `${weather.temp}&#176;F`
    return weather.type === 'forecast' ? `Forecast: ${temp}` : `Typically ${temp}`
}

function updateUI(tripInfo = TripInfo.prototype) {
    resultDiv.innerHTML = uiHtml(tripInfo.name, tripInfo.date, tripInfo.imageUrl, formattedLocation(tripInfo.geoProfile), formattedTemp(tripInfo.weather))
    document.getElementById('save-button').addEventListener('click', () => {
        postData('/api/add', tripInfo)
            .then(() => fetchTrips())
    })
}

function formattedLocation(geoProfile = GeoProfile.prototype) {
    if (geoProfile.fcl === 'P') {
        if (geoProfile.countryId === US_COUNTRY_ID) {
            return `${geoProfile.name}, ${geoProfile.adminCode1}`
        }
        return `${geoProfile.name}, ${geoProfile.countryName}`
    }
    return geoProfile.name
}

function dateToMillis(date = '2021-08-25') {
    const year = parseInt(date.slice(0, 4))
    const month = parseInt(date.slice(5, 7))
    const day = parseInt(date.slice(8))
    const res = new Date()
    res.setFullYear(year, month - 1, day)
    return res.getTime()
}

function uiHtml(title = '', subtitle = '', img = '', bodyLine1 = '', bodyLine2 = '') {
    return `<div>
    <div>
        <h2 class="mdc-typography mdc-typography--headline6">${title}</h2>
        <h3 class="mdc-typography mdc-typography--subtitle2">${subtitle}</h3>
    </div>
    <div>
        <img src="${img}" alt="Image" width="320" height="180">
        <div class="mdc-typography mdc-typography--body2">${bodyLine1}</div>
        <div class="mdc-typography mdc-typography--body2">${bodyLine2}</div>
    </div>
    <div class="mdc-card__actions">
        <div id="save-button" class="mdc-card__action-buttons">
            <button class="mdc-button mdc-card__action mdc-card__action--button"><span
                    class="mdc-button__ripple"></span> Save
            </button>
        </div>
        </div>
    </div>`
}

function savedTripHtml(trip = TripInfo.prototype) {
    return `<div class="mdc-card ta-card">
    <div>
        <h2 class="mdc-typography mdc-typography--headline6">${trip.name}</h2>
        <h3 class="mdc-typography mdc-typography--subtitle2">${trip.date}</h3>
    </div>
    <div>
        <img src="${trip.imageUrl}" alt="Image" width="320" height="180">
        <div class="mdc-typography mdc-typography--body2">${formattedLocation(trip.geoProfile)}</div>
        <div class="mdc-typography mdc-typography--body2">${formattedTemp(trip.weather)}</div>
    </div>
    <div class="mdc-card__actions">
        <div data-trip-id="${trip.id}" class="mdc-card__action-buttons">
            <button class="mdc-button mdc-card__action mdc-card__action--button"><span
                    class="mdc-button__ripple"></span> Delete
            </button>
        </div>
        </div>
    </div>`
}

async function deleteTrip(id = '') {
    deleteData('api/trip', {id: id})
        .then(() => fetchTrips())
}

function updateSavedTripsUI(trips = []) {
    let htmlSegments = []
    updateVisibility('saved-trips', trips.length > 0)
    for (const trip of trips) {
        htmlSegments.push(savedTripHtml(TripInfo.from(trip)))
    }
    document.getElementById('saved-list').innerHTML = htmlSegments.join('')
    const buttons = document.querySelectorAll('div[data-trip-id]')
    buttons.forEach(button => {
        button.addEventListener('click', () => deleteTrip(button.dataset.tripId))
    })
}

async function fetchTrips() {
    fetchData('/api/all')
        .then(data => updateSavedTripsUI(data.trips))
        .catch(e => console.log('Error', e))
}

function updateVisibility(elementId = '', isVisible = true) {
    let visibility = 'visible'
    if (!isVisible) {
        visibility = 'hidden'
    }
    document.getElementById(elementId).style.visibility = visibility
}

function setMinDate() {
    const [month, date, year] = new Date().toLocaleDateString("en-US").split("/")
    const formattedMonth = month < 10 ? `0${month}` : `${month}`
    const formattedDay = date < 10 ? `0${date}` : `${date}`
    const minDate = `${year}-${formattedMonth}-${formattedDay}`
    const datePicker = document.getElementById('start')
    datePicker.setAttribute('min', minDate)
    datePicker.setAttribute('value', minDate)
}

// add click listener for when user hits 'enter' for destination and date submission
function addSubmitClickListener() {
    document.getElementById('enter').addEventListener('click', () => {
        const date = document.getElementById('start').value
        const destination = document.getElementById('name').value
        if (!destination || destination.length === 0) {
            updateVisibility('error-text', true)
            return
        }
        updateVisibility('error-text', false)
        resultDiv.innerHTML = `<h3>...</h3>`
        fetchTripInfo(destination, date)
            .then(data => updateUI(data, destination, date))
            .catch(e => {
                console.log(e)
                resultDiv.innerHTML = `<h3>An error occured</h3>`
            })
    })
}

export function run() {
    setMinDate()
    updateVisibility('error-text', false)
    updateVisibility('saved-trips', false)
    fetchWeatherBitApiKey()
    fetchPixabayApiKey()
    fetchTrips()
    addSubmitClickListener()
}

