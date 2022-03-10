// const request = require('supertest')


// // - setup ....
// // - event list should be empty
// // - try to write without auth
// // - registration should be not allowed when disabled
// // - registration should create a new user (not active) when enabled
// // - unconfirmed user cannot login
// // - should not login without auth data
// // - should login with correct authentication
// // - 

// let admin = {}
// describe('Setup', () => {
//   let app
//   beforeAll( async () => {
//     await require('../server/initialize.server.js')()
//     app = require('../server/routes.js')
//     return
//   })

//   test('should setup', async () => {
//     let response = await request(app).post('/api/setup/db').send({ db: { dialect: 'sqlite', storage: './gancio.sqlite' } })
//     expect(response.statusCode).toBe(200)
//     response = await request(app).post('/api/setup/restart')
//     expect(response.statusCode).toBe(200)
//     expect(response.body.password).toBeDefined()
//     expect(response.body.email).toBeDefined()
//     admin.password = response.body.password
//     admin.email = response.body.email
//   })

// })



// // describe('POST /api/event', () => {
// //   let app
// //   beforeAll( async () => {
// //     console.error('dentro il secondo describe di setup beforeAll')
// //     app = requireUncached('../server/routes.js')
// //     return
// //   })  
// //   test('should not allow event creation without required fields', async () => {
// //     const required_fields = {
// //       'title': {},
// //       'place_name': { title: 'test title' },
// //       'start_datetime': { title: 'test title', 'place_name': 'test place name'}
// //     }

// //     const promises = Object.keys(required_fields).map(async field => {
// //       const response = await request(app).post('/api/event').send(required_fields[field])
// //       expect(response.statusCode).toBe(400)
// //       expect(response.text).toBe(`${field} is required`)
// //       return
// //     })
    
// //     return Promise.all(promises)
// //   })
// // })