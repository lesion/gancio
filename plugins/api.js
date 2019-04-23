// import axios from 'axios'
// import { getters } from '@/store'
// const api = axios.create({
//   baseURL: process.env.NODE_ENV === 'development' ? 'http://localhost:3000/api' : '/api',
//   withCredentials: true,
//   responseType: 'json',
//   headers: {
//   //   'Access-Control-Allow-Origin': '*',
//   //   'Access-Control-Allow-Credentials': 'true',
//   //   'Accept': 'application/json',
//     'Content-Type': 'application/json'
//   }
// })

// export default function ({ $axios }) {
//   function get(path) {
//     return $axios.$get(path, { headers: { 'Authorization': 'Bearer ' + getters.token } })
//   }

//   function post(path, data) {
//     return $axios.$post(path, data)
//   }

  // function post(path, data) {
  //   return api.post(path, data) // , { headers: { 'Authorization': getters.token } })
  //     .then(res => res.data)
  //     .catch((e) => {
  //       console.error(e)
  //       if (e.response.status === 403) {
  //         // store.commit('logout') // TOFIX
  //         return false
  //       }
  //       throw e.response && e.response.data &&
  //         e.response.data.errors && e.response.data.errors[0].message
  //     })
  // }
  // function put(path, data) {
  //   return api.put(path, data, { headers: { 'Authorization': getters.token } })
  //     .then(ret => ret.data)
  // }

  // function del(path) {
  //   return api.delete(path, { headers: { 'Authorization': getters.token } }).then(ret => ret.data)
  // }

  // return {
    // login: (email, password) => post('/login', { email, password }),
    // register: user => post('/user', user)

  //   // password recovery
  //   forgotPassword: email => post('/user/recover', { email }),
  //   checkRecoverCode: recover_code => post('/user/check_recover_code', { recover_code }),
  //   recoverPassword: (recover_code, password) => post('/user/recover_password', { recover_code, password }),

  //   getAllEvents: (month, year) => get(`/event/${year}/${month}`),
  //   getUnconfirmedEvents: () => get('/event/unconfirmed'),

  //   confirmEvent: id => get(`/event/confirm/${id}`),
  //   unconfirmEvent: id => get(`/event/unconfirm/${id}`),

  //   addNotification: notification => post('/event/notification', notification),
  //   delNotification: code => del(`/event/notification/${code}`),

  //   addEvent: event => post('/user/event', event),
  //   updateEvent: event => put('/user/event', event),

  //   updatePlace: place => put('/place', place),
  //   delEvent: eventId => del(`/user/event/${eventId}`),
  //   getEvent: eventId => get(`/event/${eventId}`),
  //   getMeta: () => get('/event/meta'),
  //   getUser: () => get('/user'),
  //   getUsers: () => get('/users'),
  //   updateTag: tag => put('/tag', tag),
  //   updateUser: user => put('/user', user),
  //   getAuthURL: mastodonInstance => post('/user/getauthurl', mastodonInstance),
  //   setCode: code => post('/user/code', code),
  //   getAdminSettings: () => get('/settings')
  //   // setAdminSetting: (key, value) => post('/settings', { key, value })
//   }
// }
