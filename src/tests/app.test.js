import {formattedTemp} from "../client/js/app";
import {WeatherInfo} from "../client/js/vo";

test('formattedTemp typical', () => {
    expect(formattedTemp(new WeatherInfo(27))).toEqual('Typically 27&#176;F')
})

test('formattedTemp forecast', () => {
    expect(formattedTemp(new WeatherInfo(27, 'forecast'))).toEqual('Forecast: 27&#176;F')
})