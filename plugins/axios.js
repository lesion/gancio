export default function ({ $axios, store }) {
  if (process.client) {
    $axios.setBaseURL(window.location.origin + '/api')
  } else {
    const config = require('../server/config')
    $axios.setBaseURL(config.baseurl + '/api')
  }
}
