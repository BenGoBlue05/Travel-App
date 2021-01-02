class WeatherInfo {
    constructor(temp = 0.0, type = 'typical') {
        this.temp = temp
        this.type = type
    }
}

class GeoProfile {

    constructor(name = '', adminCode1 = '', fcl = '', countryId = '', countryName = '', lat = 0.0, lng = 0.0) {
        this.name = name;
        this.adminCode1 = adminCode1;
        this.fcl = fcl;
        this.countryId = countryId;
        this.countryName = countryName;
        this.lat = lat;
        this.lng = lng;
    }

    static from(data = {}) {
        return new GeoProfile(data.name, data.adminCode1, data.fcl, data.countryId, data.countryName, data.lat, data.lng)
    }
}

class PlaceInfo {
    constructor(geoProfile = GeoProfile.prototype, weatherInfo = WeatherInfo.prototype) {
        this.geoProfile = geoProfile
        this.weatherInfo = weatherInfo
    }
}

class TripInfo {
    constructor(name = '', date = '', weather = WeatherInfo.prototype, geoProfile = GeoProfile.prototype, imageUrl = '', id = '') {
        this.name = name
        this.date = date
        this.weather = weather
        this.geoProfile = geoProfile
        this.imageUrl = imageUrl
        this.id = id
    }

    static from(data = {}) {
        return new TripInfo(data.name, data.date, data.weather, data.geoProfile, data.imageUrl, data.id)
    }
}

let weatherBitApiKey = ''
let pixabayApiKey = ''

const US_COUNTRY_ID = '6252001'

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
    fetchData('/api/weatherbitKey')
        .then(data => weatherBitApiKey = data.key)
        .catch(e => console.log('Error:', e))
}

async function fetchPixabayApiKey() {
    fetchData('/api/pixabayKey')
        .then(data => pixabayApiKey = data.key)
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

async function fetchPlaceInfo(destination = '', date = '') {
    return fetchGeoProfile(destination).then(data => placeInfo(data, date))
}

async function placeInfo(geoProfile = GeoProfile.prototype, date = '') {
    return fetchTypicalWeather(geoProfile.lat, geoProfile.lng, date.slice(5))
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

function formattedTemp(temp = 0.0) {
    return `Typically ${temp}&#176;F`
}

function updateUI(tripInfo = TripInfo.prototype) {
    resultDiv.innerHTML = uiHtml(tripInfo.name, tripInfo.date, tripInfo.imageUrl, formattedLocation(tripInfo.geoProfile), formattedTemp(tripInfo.weather.temp))
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
    return `<div>
    <div>
        <h2 class="mdc-typography mdc-typography--headline6">${trip.name}</h2>
        <h3 class="mdc-typography mdc-typography--subtitle2">${trip.date}</h3>
    </div>
    <div>
        <img src="${trip.imageUrl}" alt="Image" width="320" height="180">
        <div class="mdc-typography mdc-typography--body2">${formattedLocation(trip.geoProfile)}</div>
        <div class="mdc-typography mdc-typography--body2">${formattedTemp(trip.weather.temp)}</div>
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
    fetchData('/api/trips').then(data => updateSavedTripsUI(data.trips))
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

setMinDate()
updateVisibility('saved-trips', false)
fetchWeatherBitApiKey()
fetchPixabayApiKey()
fetchTrips()

document.getElementById('enter').addEventListener('click', () => {
    const date = document.getElementById('start').value
    const destination = document.getElementById('name').value
    resultDiv.innerHTML = `<h3>...</h3>`
    fetchTripInfo(destination, date)
        .then(data => updateUI(data, destination, date))
        .catch(e => {
            console.log(e)
            resultDiv.innerHTML = `<h3>An error occured</h3>`
        })
})

