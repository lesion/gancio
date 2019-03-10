import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersistence from 'vuex-persist'
import { intersection } from 'lodash'
import api from './api'
import moment from 'dayjs'
Vue.use(Vuex)

const vuexLocal = new VuexPersistence({
  storage: window.localStorage,
  reducer: state => ({ logged: state.logged, user: state.user, token: state.token })
})

export default new Vuex.Store({
  plugins: [vuexLocal.plugin],
  getters: {
    token: state => state.token,
    filteredEvents: state => {
      const events = state.events.map(e => {
        const past = (moment().diff(e.start_datetime, 'minutes') > 0)
        e.past = past
        return e
      })
      if (!state.filters.tags.length && !state.filters.places.length) {
        return events
      }
      return events.filter(e => {
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
  },
  state: {
    logged: false,
    user: {},
    token: '',
    events: [],
    tags: [],
    places: [],
    //
    filters: {
      tags: [],
      places: []
    }
  },
  mutations: {
    logout (state) {
      state.logged = false
      state.token = ''
      state.user = {}
    },
    login (state, user) {
      state.logged = true
      state.user = user.user
      state.token = user.token
    },
    setEvents (state, events) {
      state.events = events
    },
    addEvent (state, event) {
      state.events.push(event)
    },
    updateEvent (state, event) {
      state.events = state.events.map(e => {
        if (e.id !== event.id) return e
        return event
      })
    },
    delEvent (state, eventId) {
      state.events = state.events.filter(ev => ev.id !== eventId)
    },
    update (state, { tags, places }) {
      state.tags = tags
      state.places = places
    },
    // search
    addSearchTag (state, tag) {
      if (!state.filters.tags.find(t => t === tag.tag)) {
        state.filters.tags.push(tag.tag)
      } else {
        state.filters.tags = state.filters.tags.filter(t => t !== tag.tag)
      }
    },
    setSearchTags (state, tags) {
      state.filters.tags = tags
    },
    addSearchPlace (state, place) {
      if (state.filters.places.find(p => p.name === place.name)) {
        state.filters.places.push(place)
      }
    },
    setSearchPlaces (state, places) {
      state.filters.places = places
    }
  },
  actions: {
    async updateEvents ({ commit }, date) {
      const events = await api.getAllEvents(date.month - 1, date.year)
      commit('setEvents', events)
    },
    async updateMeta ({ commit }) {
      const { tags, places } = await api.getMeta()
      commit('update', { tags, places })
    },
    async addEvent ({ commit }, formData) {
      const event = await api.addEvent(formData)
      if (this.state.logged) {
        commit('addEvent', event)
      }
    },
    async updateEvent ({ commit }, formData) {
      const event = await api.updateEvent(formData)
      commit('updateEvent', event)
    },
    delEvent ({ commit }, eventId) {
      commit('delEvent', eventId)
    },
    login ({ commit }, user) {
      commit('login', user)
    },
    logout ({ commit }) {
      commit('logout')
    },
    // search
    addSearchTag ({ commit }, tag) {
      commit('addSearchTag', tag)
    },
    setSearchTags ({ commit }, tags) {
      commit('setSearchTags', tags)
    },
    addSearchPlace ({ commit }, place) {
      commit('addSearchPlace', place)
    },
    setSearchPlaces ({ commit }, places) {
      commit('setSearchPlaces', places)
    }
  }
})
