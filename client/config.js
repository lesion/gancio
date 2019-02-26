const env = process.env.NODE_ENV
const beConf = require('../config/config.' + env + '.json')

const conf = {
  // environment
  title: beConf.title,
  description: beConf.description,

  // base url
  baseurl: beConf.baseurl,
  apiurl: beConf.apiurl
}

export default conf
