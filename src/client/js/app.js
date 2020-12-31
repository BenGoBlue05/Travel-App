class WeatherInfo {
    constructor(temp = 0.0, type = 'typical') {
        this.temp = temp
        this.type = type
    }
}

class GeoProfile {

    constructor(name = '', adminCode1 = '', fcl = '', countryId = 0, countryName = '', lat = 0.0, lng = 0.0) {
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
    constructor(name = '', date = '', weather = WeatherInfo.prototype, geoProfile = GeoProfile.prototype, imageUrl = '') {
        this.name = name
        this.date = date
        this.weather = weather
        this.geoProfile = geoProfile
        this.imageUrl = imageUrl
    }
}

let weatherBitApiKey = ''
let pixabayApiKey = ''

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
    return fetchTypicalWeather(geoProfile.lat, geoProfile.lng, date)
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

function updateUI(tripInfo = TripInfo.prototype, title = '', subtitle = '') {
    resultDiv.innerHTML = uiHtml(title, subtitle, tripInfo.imageUrl, `${tripInfo.weather.temp}&#176;F`)
    document.getElementById('save-button').addEventListener('click', () => {
        postData('/api/add', tripInfo)
    })
}

function uiHtml(title = '', subtitle = '', img = '', body = '') {
    return `<div>
    <div>
        <h2 class="mdc-typography mdc-typography--headline6">${title}</h2>
        <h3 class="mdc-typography mdc-typography--subtitle2">${subtitle}</h3>
    </div>
    <div>
        <img src="${img}" alt="Image" width="320" height="180">
        <div class="mdc-typography mdc-typography--body2">${body}</div>
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

fetchWeatherBitApiKey()
fetchPixabayApiKey()

document.getElementById('enter').addEventListener('click', () => {
    const date = document.getElementById('start').value
    const destination = document.getElementById('name').value
    resultDiv.innerHTML = `<h3>...</h3>`
    fetchTripInfo(destination, date.slice(5))
        .then(data => updateUI(data, destination, date))
        .catch(e => {
            console.log(e)
            resultDiv.innerHTML = `<h3>An error occured</h3>`
        })
})

