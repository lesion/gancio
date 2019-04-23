import moment from 'dayjs'
import { intersection } from 'lodash'
import api from '~/plugins/api'
import Vue from 'vue'

Vue.config.errorHandler = function (err, vm, info) {
  // handle error
  // `info` is a Vue-specific error info, e.g. which lifecycle hook
  // the error was found in. Only available in 2.2.0+
  console.error(err)
  console.error(info)
}

export const state = () => ({
  events: [],
  user: {},
  logged: false,
  token: '',
  tags: [],
  places: [],
  filters: {
    tags: [],
    places: []
  }
})

export const getters = {
  token: state => state.token,
  // filter current + future events only
  // plus, filter matches search tag/place
  filteredEvents: (state) => {
    const events = state.events.map((e) => {
      const end_datetime = e.end_datetime || moment(e.start_datetime).add('3', 'hour')
      const past = (moment().diff(end_datetime, 'minutes') > 0)
      e.past = past
      return e
    })
    if (!state.filters.tags.length && !state.filters.places.length) {
      return events
    }
    return events.filter((e) => {
      if (state.filters.tags.length) {
        const m = intersection(e.tags.map(t => t.tag), state.filters.tags)
        if (m.length > 0) return true
      }
      if (state.filters.places.length) {
        if (state.filters.places.find(p => p === e.place.name)) {
          return true
        }
      }
      return 0
    })
  }
}

export const mutations = {
  logout(state) {
    state.logged = false
    state.token = ''
    state.user = {}
  },
  login(state, user) {
    state.logged = true
    state.user = user.user
    state.token = user.token
  },
  setEvents(state, events) {
    state.events = events
  },
  addEvent(state, event) {
    state.events.push(event)
  },
  updateEvent(state, event) {
    state.events = state.events.map((e) => {
      if (e.id !== event.id) return e
      return event
    })
  },
  delEvent(state, eventId) {
    state.events = state.events.filter(ev => ev.id !== eventId)
  },
  update(state, { tags, places }) {
    state.tags = tags
    state.places = places
  },
  // search
  addSearchTag(state, tag) {
    if (!state.filters.tags.find(t => t === tag.tag)) {
      state.filters.tags.push(tag.tag)
    } else {
      state.filters.tags = state.filters.tags.filter(t => t !== tag.tag)
    }
  },
  setSearchTags(state, tags) {
    state.filters.tags = tags
  },
  addSearchPlace(state, place) {
    if (state.filters.places.find(p => p.name === place.name)) {
      state.filters.places.push(place)
    }
  },
  setSearchPlaces(state, places) {
    state.filters.places = places
  }
}

export const actions = {
  // called on server request
  // get current month's event
  async nuxtServerInit({ commit }, { req }) {
    // set user if logged! TODO

    const now = new Date()
    // const events = await api.getAllEvents(now.getMonth() - 1, now.getFullYear())
    const events = await this.$axios.$get(`/event/${now.getMonth() - 1}/${now.getFullYear()}`)
    commit('setEvents', events)
  },
  async updateMeta({ commit }) {
    const { tags, places } = await this.$axios.$get('/event/meta')
    commit('update', { tags, places })
  },
  async addEvent({ commit }, formData) {
    console.log('ciao addEvent')
    const event = await this.$axios.$post('/user/event', formData) // .addEvent(formData)
    if (this.state.logged) {
      commit('addEvent', event)
    }
  },
  async updateEvent({ commit }, formData) {
    const event = await this.$axios.$put('/user/event', formData)
    commit('updateEvent', event)
  },
  delEvent({ commit }, eventId) {
    commit('delEvent', eventId)
  },
  login({ commit }, user) {
    this.$axios.setToken(user.token)
    commit('login', user)
  },
  logout({ commit }) {
    this.$axios.setToken(false)
    commit('logout')
  },
  // search
  addSearchTag({ commit }, tag) {
    commit('addSearchTag', tag)
  },
  setSearchTags({ commit }, tags) {
    commit('setSearchTags', tags)
  },
  addSearchPlace({ commit }, place) {
    commit('addSearchPlace', place)
  },
  setSearchPlaces({ commit }, places) {
    commit('setSearchPlaces', places)
  }
}
// export const getters = {
//   filteredEvents: state => state.events
// }
