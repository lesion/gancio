const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const api = require('./app/api')
const cors = require('cors')
const path = require('path')
const port = process.env.PORT || 8080

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use('/static', express.static(path.join(__dirname, 'uploads')))
app.use('/uploads', express.static('uploads'))
app.use('/', express.static(path.join(__dirname, 'client', 'dist')))
app.use(cors())
app.use('/api', api)

app.listen(port)
console.log('Magic happens at http://localhost:' + port)
