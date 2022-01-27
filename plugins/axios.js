export default function ({ $axios, store, res }) {
  if (process.client) {
    $axios.defaults.baseURL = window.location.origin + '/api'
  } else {
    $axios.defaults.headers.common['host'] = res.locals.hostname
  }
}
