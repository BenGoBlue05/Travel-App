const request = require('supertest')
const { app } = require('../server/server')

describe('Post', () => {
    it('save trip', async () => {
        const response = await request(app)
            .post('/api/add')
            .send(
                {
                    name: 'Detroit',
                    date: '01-02-2022',
                    weather: {
                        temp: 22.0,
                        type: 'forecast'
                    },
                    geoProfile: {
                        name: 'Detroit',
                        adminCode1: 'a',
                        fcl: 'test',
                        countryId: '1',
                        countryName: 'USA',
                        lat: '22.2',
                        lng: '10.1'
                    },
                    imageUrl: 'img.png',
                    id: '1'
                }
            )
        expect(response.statusCode).toEqual(201)
    })
})