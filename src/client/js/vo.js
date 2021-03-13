export class WeatherInfo {
    constructor(temp = 0.0, type = 'typical') {
        this.temp = temp
        this.type = type
    }
}

export class GeoProfile {

    constructor(name = '', adminCode1 = '', fcl = '', countryId = '', countryName = '', lat = 0.0, lng = 0.0) {
        this.name = name;
        this.adminCode1 = adminCode1;
        this.fcl = fcl;
        this.countryId = countryId;
        this.countryName = countryName;
        this.lat = lat;
        this.lng = lng;
    }

    // converts json response to GeoProfile value object
    static from(data = {}) {
        return new GeoProfile(data.name, data.adminCode1, data.fcl, data.countryId, data.countryName, data.lat, data.lng)
    }
}

export class PlaceInfo {
    constructor(geoProfile = GeoProfile.prototype, weatherInfo = WeatherInfo.prototype) {
        this.geoProfile = geoProfile
        this.weatherInfo = weatherInfo
    }
}

export class TripInfo {
    constructor(name = '', date = '', weather = WeatherInfo.prototype, geoProfile = GeoProfile.prototype, imageUrl = '', id = '') {
        this.name = name
        this.date = date
        this.weather = weather
        this.geoProfile = geoProfile
        this.imageUrl = imageUrl
        this.id = id
    }

    // converts json response to TripInfo value object
    static from(data = {}) {
        return new TripInfo(data.name, data.date, data.weather, data.geoProfile, data.imageUrl, data.id)
    }
}
