async function fetchData(url = '') {
    return (await fetch(url)).json()
}

function fetchWeatherBitApiKey() {
    fetchData('/api/weatherbitKey')
        .then((data) => console.log(`WeatherBit API KEY: ${data.key}`))
        .catch(e => console.log('Error:', e))
}

function fetchPixabayApiKey() {
    fetchData('/api/pixabayKey')
        .then((data) => console.log(`Pixabay API KEY: ${data.key}`))
        .catch(e => console.log('Error:', e))
}


fetchWeatherBitApiKey()
fetchPixabayApiKey()

