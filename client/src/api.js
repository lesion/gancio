import axios from 'axios'
import config from '../config'
import store from './store'
const api = axios.create({
  baseURL: config.apiurl,
  withCredentials: false,
  responseType: 'json',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
})

function get (path) {
  return api.get(path, { headers: { 'x-access-token': store.state.token } }).then(ret => ret.data)
}

function post (path, data) {
  return api.post(path, data, { headers: { 'x-access-token': store.state.token } }).then(ret => ret.data)
}
function put (path, data) {
  return api.put(path, data, { headers: { 'x-access-token': store.state.token } }).then(ret => ret.data)
}

function del (path) {
  console.log(store.state.token)
  return api.delete(path, { headers: { 'x-access-token': store.state.token } }).then(ret => ret.data)
}

export default {
  login: (email, password) => post('/login', { email, password }),
  register: user => post('/user', user),
  getAllEvents: (month, year) => get(`/event/${year}/${month}/`),
  addEvent: event => post('/user/event', event),
  updateEvent: event => put('/user/event', event),
  updatePlace: place => put('/place', place),
  delEvent: eventId => del(`/user/event/${eventId}`),
  getEvent: eventId => get(`/event/${eventId}`),
  getMeta: () => get('/event/meta'),
  getUser: () => get('/user'),
  getUsers: () => get('/users'),
  updateTag: (tag) => put('/tag', tag),
  updateUser: user => put('/user', user),
  getAuthURL: mastodonInstance => post('/user/getauthurl', mastodonInstance),
  setCode: code => post('/user/code', code),
  getKnowLocations: () => get('/locations'),
  getKnowTags: () => get('/tags')
}
