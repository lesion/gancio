import moment from 'dayjs'
import intersection from 'lodash/intersection'
import map from 'lodash/map'

export const state = () => ({
  // config: {},
  locale: '',
  events: [],
  tags: [],
  places: [],
  settings: {

  },
  filters: {
    tags: [],
    places: [],
    show_past_events: false,
    show_recurrent_events: false,
    show_pinned_event: false
  }
})

export const getters = {

  // filter matches search tag/place
  filteredEvents: state => {
    let events = state.events

    // TOFIX: use lodash
    if (state.filters.tags.length || state.filters.places.length) {
      events = events.filter((e) => {
        if (state.filters.tags.length) {
          const m = intersection(e.tags.map(t => t.tag), state.filters.tags)
          if (m.length > 0) return true
        }
        if (state.filters.places.length) {
          if (state.filters.places.find(p => p === e.place.id)) {
            return true
          }
        }
        return 0
      })
    }

    if (!state.filters.show_past_events) {
      events = events.filter(e => !e.past)
    }

    return events
  },
  // filter matches search tag/place
  filteredEventsWithPast: state => {
    let events = state.events

    // TOFIX: use lodash
    if (state.filters.tags.length || state.filters.places.length) {
      events = events.filter((e) => {
        if (state.filters.tags.length) {
          const m = intersection(e.tags.map(t => t.tag), state.filters.tags)
          if (m.length > 0) return true
        }
        if (state.filters.places.length) {
          if (state.filters.places.find(p => p === e.place.id)) {
            return true
          }
        }
        return 0
      })
    }

    return events
  }


}

export const mutations = {
  setEvents(state, events) {
    // set`past` and `newDay` flags to event
    let lastDay = null
    state.events = events.map((e) => {
      const currentDay = moment(e.start_datetime*1000).date()
      e.newDay = (!lastDay || lastDay !== currentDay) && currentDay
      lastDay = currentDay      
      const end_datetime = e.end_datetime || e.start_datetime+3600*2
      const past = (moment().unix() - end_datetime) > 0
      e.past = !!past
      return e
    })
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
    state.events = state.events.filter(ev => {
      return ev.id !== eventId
    })
  },
  update(state, { tags, places }) {
    state.tags = tags
    state.places = places
  },
  setSearchTags(state, tags) {
    state.filters.tags = tags
  },
  setSearchPlaces(state, places) {
    state.filters.places = places
  },
  showPastEvents(state, show) {
    state.filters.show_past_events = show
  },
  setSettings(state, settings) {
    state.settings = settings
  },
  setSetting(state, setting) {
    state.settings[setting.key] = setting.value
  },
  setLocale(state, locale) {
    state.locale = locale
  }
}

export const actions = {
  // this method is called server side only for each request
  // we use it to get configuration from db
  async nuxtServerInit ({ commit }, { app, req } ) {
    const settings = await app.$axios.$get('/settings')
    commit('setSettings', settings)
    console.error('SETTINGS', settings)

    const lang = req.acceptsLanguages('en', 'it')
    commit('setLocale', lang || 'it')
  },
  async updateEvents({ commit }, page) {
    const events = await this.$axios.$get(`/event/${page.month - 1}/${page.year}`)
    commit('setEvents', events)
  },
  async updateMeta({ commit }) {
    const { tags, places } = await this.$axios.$get('/event/meta')
    commit('update', { tags, places })
  },
  async addEvent({ commit }, formData) {
    const event = await this.$axios.$post('/user/event', formData)
    if (event.user) {
      commit('addEvent', event)
    }
  },
  async updateEvent({ commit }, formData) {
    const event = await this.$axios.$put('/user/event', formData)
    if (event.user) {
      commit('updateEvent', event)
    }
  },
  delEvent({ commit }, eventId) {
    commit('delEvent', eventId)
  },
  setSearchTags({ commit }, tags) {
    commit('setSearchTags', tags)
  },
  setSearchPlaces({ commit }, places) {
    commit('setSearchPlaces', places)
  },
  showPastEvents({ commit }, show) {
    commit('showPastEvents', show)
  },
  async setSetting({ commit }, setting) {
    await this.$axios.$post('/settings', setting )
    commit('setSetting', setting)
  },
}
