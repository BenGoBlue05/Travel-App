let weatherBitApiKey = ''
let pixabayApiKey = ''

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

async function fetchTripInfo(destination = '', date = '') {
    return fetchCoords(destination)
        .then(data => {
            const result = data.geonames[0]
            return fetchTypicalWeather(result.lat, result.lng, date)
        })
        .then(data => data.data[0])
        .catch(e => console.log(e))
}

function updateUI(data = {}) {
    const div = document.getElementById('result')
    const temp = data.temp
    div.innerHTML = `<h3>${temp}&#176;F</h3>`
}

fetchWeatherBitApiKey()
fetchPixabayApiKey()

document.getElementById('enter').addEventListener('click', () => {
    const date = document.getElementById('start').value
    const destination = document.getElementById('name').value
    fetchTripInfo(destination, date.slice(5))
        .then(data => updateUI(data))
})

