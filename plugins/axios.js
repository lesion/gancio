export default function({ $axios, store }) {
  if (process.client) {
    $axios.defaults.baseURL = window.location.origin + '/api'
  }
}