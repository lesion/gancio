export default function({ $axios, store }) {
  if (process.server) {
    console.error('dentro il server ', store.settings )
    // $axios.defaults.baseurl = 
  } else {
    // const protocol = window.location.protocol
    // const hostname = window.location.hostname
    // const port = 8000
    // const url = `${protocol}//${hostname}:${port}`
    $axios.defaults.baseURL = window.location.origin + '/api'
    console.error('dentro il client !')
  }
}