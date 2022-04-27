// needed by sequelize
const config = require('./config')
config.load()
module.exports = config.db
