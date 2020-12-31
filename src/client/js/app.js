let weatherBitApiKey = ''
let pixabayApiKey = ''

class TripInfo {
    constructor(temp = 0.0, url = '') {
        this.temp = temp
        this.url = url
    }
}

async function fetchData(url = '') {
    return fetch(url).then(data => data.json())
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

async function fetchCoords(name = '') {
    const url = `http://api.geonames.org/searchJSON?q=${name}&username=benlewis05&maxRows=1`
    return fetchData(url)
}

async function fetchTypicalWeather(lat = 0.0, lng = 0.0, date = '01-01') {
    const baseUrl = 'https://api.weatherbit.io/v2.0/normals'
    const url = `${baseUrl}?lat=${lat}&lon=${lng}&start_day=${date}&end_day=${date}&units=I&key=${weatherBitApiKey}`
    return fetchData(url)
}

async function fetchWeatherInfo(destination = '', date = '') {
    return fetchCoords(destination)
        .then(data => {
            const result = data.geonames[0]
            return fetchTypicalWeather(result.lat, result.lng, date)
        })
        .then(data => data.data[0])
}

async function fetchImage(query = '') {
    const url = `https://pixabay.com/api/?q=${query}&key=${pixabayApiKey}`
    return fetchData(url)
        .then(data => data.hits[0].webformatURL)
}

async function fetchTripInfo(destination = '', date = '') {
    return Promise.all([fetchWeatherInfo(destination, date), fetchImage(destination)])
        .then(results => {
            const weatherInfo = results[0]
            const imgUrl = results[1]
            return new TripInfo(weatherInfo.temp, imgUrl)
        })
}

let defaultTripInfo = new TripInfo()

const resultDiv = document.getElementById('result')

function updateUI(data = defaultTripInfo, title = '', subtitle = '') {
    resultDiv.innerHTML = uiHtml(title, subtitle, data.url, `${data.temp}&#176;F`)
}

function uiHtml(title = '', subtitle = '', img = '', body = '') {
    return `<div>
        <h2 class="mdc-typography mdc-typography--headline6">${title}</h2>
        <h3 class="mdc-typography mdc-typography--subtitle2">${subtitle}</h3>
    </div>
    <div>
        <img src="${img}" alt="Image" width="320" height="180">
        <div class="mdc-typography mdc-typography--body2">${body}</div>
    </div>
    <div class="mdc-card__actions">
        <div class="mdc-card__action-buttons">
            <button class="mdc-button mdc-card__action mdc-card__action--button"><span
                    class="mdc-button__ripple"></span> Save
            </button>
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

