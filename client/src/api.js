import axios from 'axios'
import store from './store'
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'development' ? 'http://localhost:9000/api' : '/api',
  withCredentials: false,
  responseType: 'json',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
})

function get (path) {
  return api.get(path, { headers: { 'x-access-token': store.state.token } })
    .then(res => res.data)
    .catch(e => {
      if (e.response.status === 403) {
        store.commit('logout')
        return false
      }
      throw e.response && e.response.data &&
        e.response.data.errors && e.response.data.errors[0].message
    })
}

function post (path, data) {
  return api.post(path, data, { headers: { 'x-access-token': store.state.token } })
    .then(res => res.data)
    .catch(e => {
      if (e.response.status === 403) {
        store.commit('logout')
        return false
      }
      throw e.response && e.response.data &&
        e.response.data.errors && e.response.data.errors[0].message
    })
}
function put (path, data) {
  return api.put(path, data, { headers: { 'x-access-token': store.state.token } })
    .then(ret => ret.data)
}

function del (path) {
  return api.delete(path, { headers: { 'x-access-token': store.state.token } }).then(ret => ret.data)
}

export default {
  login: (email, password) => post('/login', { email, password }),
  register: user => post('/user', user),

  // password recovery
  forgotPassword: email => post('/user/recover', { email }),
  checkRecoverCode: recover_code => post('/user/check_recover_code', { recover_code }),
  recoverPassword: (recover_code, password) => post('/user/recover_password', { recover_code, password }),

  getAllEvents: (month, year) => get(`/event/${year}/${month}`),
  getUnconfirmedEvents: () => get('/event/unconfirmed'),

  confirmEvent: id => get(`/event/confirm/${id}`),
  unconfirmEvent: id => get(`/event/unconfirm/${id}`),

  addNotification: notification => post('/event/notification', notification),
  delNotification: code => del(`/event/notification/${code}`),

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
  getAdminSettings: () => get('/settings')
  // setAdminSetting: (key, value) => post('/settings', { key, value })
}
