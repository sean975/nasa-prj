const request = require('supertest')
const app = require('../../app')
const {mongoConnect, mongoDisconnect} = require('../../services/mongo')

describe('Launches API', () => {
  beforeAll(async () => await mongoConnect())
  afterAll(async () => await mongoDisconnect())

  describe('Test GET /launches', () => {
    test('It should respond with 200 success', async () => {
      await request(app).get('/v1/launches').expect(200)
    })
  })
  describe('Test POST /launches', () => {
    const completeLaunchData = {
              mission: 'USS Enterprise',
              rocket: 'NCC 1030-f',
              target: 'Kepler-62 f',
              launchDate: 'January 4, 2029'
            }
    const launchDataWithoutDate = {
              mission: 'USS Enterprise',
              rocket: 'NCC 1030-f',
              target: 'Kepler-62 f',
            }
    const launchDataWithInvalidDate = {
              mission: 'USS Enterprise',
              rocket: 'NCC 1030-f',
              target: 'Kepler-62 f',
              launchDate: 'hello'
            }

    test('It should respond with 201 created', async() => {
      const response = await request(app)
            .post('/v1/launches')
            .send(completeLaunchData)
            .expect('Content-Type', /json/)
            .expect(201)

      const requestDate = new Date(completeLaunchData.launchDate).valueOf()
      const responseDate = new Date(response.body.launchDate).valueOf()
      expect(responseDate).toBe(requestDate)

      expect(response.body).toMatchObject(launchDataWithoutDate)
    })
    test('It should catch missing required properties', async() => {
      const response = await request(app)
            .post('/v1/launches')
            .send(launchDataWithoutDate)
            .expect('Content-Type', /json/)
            .expect(400)

      expect(response.body).toStrictEqual({
        error: 'Missing required launch property'
      })
    })
    test('It should catch invalid dates', async() => {
      const response = await request(app)
            .post('/v1/launches')
            .send(launchDataWithInvalidDate)
            .expect('Content-Type', /json/)
            .expect(400)
      expect(response.body).toStrictEqual({
        error: 'Invalid launch date'
      })
    })
  })
})
