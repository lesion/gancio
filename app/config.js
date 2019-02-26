const env = process.env.NODE_ENV
const conf = require('../config/config.' + env + '.json')
module.exports = conf
