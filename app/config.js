const env = process.env.NODE_ENV
module.exports = require('../config/config.' + env + '.js')
