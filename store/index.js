import moment from 'moment-timezone'
import intersection from 'lodash/intersection'
import find from 'lodash/find'

export const state = () => ({
  locale: '',
  user_locale: {},
  events: [],
  tags: [],
  places: [],
  settings: {
    instance_timezone: 'Europe/Rome',
    instance_name: '',
    allow_registration: true,
    allow_anon_event: true,
    allow_recurrent_event: true,
    recurrent_event_visible: false,
    enable_federation: false,
    enable_resources: false,
    hide_boosts: true
  },
  in_past: false,
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
    const search_for_tags = !!state.filters.tags.length
    const search_for_places = !!state.filters.places.length

    const search_place_ids = state.filters.places.map(p => p.id)
    const search_tags_tags = state.filters.tags.map(t => t.id)

    return state.events.filter(e => {
      // filter past events
      if (!state.filters.show_past_events && e.past) { return false }

      // filter recurrent events
      if (!state.filters.show_recurrent_events && e.recurrent) { return false }

      if (search_for_places) {
        if (search_place_ids.includes(e.place.id)) {
          return true
        }
      }

      if (search_for_tags) {
        const common_tags = intersection(e.tags, search_tags_tags)
        if (common_tags.length > 0) { return true }
      }

      if (!search_for_places && !search_for_tags) { return true }

      return false
    })
  },

  // filter matches search tag/place including past events
  filteredEventsWithPast: state => {
    const search_for_tags = !!state.filters.tags.length
    const search_for_places = !!state.filters.places.length

    return state.events.filter(e => {
      const match = false

      // filter recurrent events
      if (!state.filters.show_recurrent_events && e.recurrent) { return false }

      if (!match && search_for_places) {
        if (find(state.filters.places, p => p.id === e.place.id)) { return true }
      }

      if (search_for_tags) {
        const common_tags = intersection(e.tags, state.filters.tags.map(t => t.tag))
        if (common_tags.length > 0) { return true }
      }

      if (!search_for_places && !search_for_tags) { return true }

      return false
    })
  }
}

export const mutations = {
  setEvents (state, events) {
    // set`past` and `newDay` flags to event
    let lastDay = null
    state.events = events.map(e => {
      const currentDay = moment.unix(e.start_datetime).date()
      e.newDay = (!lastDay || lastDay !== currentDay) && currentDay
      lastDay = currentDay
      const end_datetime = e.end_datetime || e.start_datetime + 3600 * 2
      const past = ((moment().unix()) - end_datetime) > 0
      e.past = !!past
      return e
    })
  },
  addEvent (state, event) {
    state.events.push(event)
  },
  updateEvent (state, event) {
    state.events = state.events.map((e) => {
      if (e.id !== event.id) { return e }
      return event
    })
  },
  delEvent (state, eventId) {
    state.events = state.events.filter(ev => {
      return ev.id !== eventId
    })
  },
  update (state, { tags, places }) {
    state.tags = tags
    state.places = places
  },
  setSearchTags (state, tags) {
    state.filters.tags = tags
  },
  setSearchPlaces (state, places) {
    state.filters.places = places
  },
  showPastEvents (state, show) {
    state.filters.show_past_events = show
  },
  showRecurrentEvents (state, show) {
    state.filters.show_recurrent_events = show
  },
  setSettings (state, settings) {
    state.settings = settings
  },
  setSetting (state, setting) {
    state.settings[setting.key] = setting.value
  },
  setLocale (state, locale) {
    state.locale = locale
  },
  setPast (state, in_past) {
    state.in_past = in_past
  }
}

export const actions = {
  // this method is called server side only for each request for nuxt
  // we use it to get configuration from db, set locale, etc...
  nuxtServerInit ({ commit }, { req }) {
    commit('setSettings', req.settings)

    commit('setEvents', req.events)
    commit('update', req.meta)

    // apply settings
    commit('showRecurrentEvents', req.settings.allow_recurrent_event && req.settings.recurrent_event_visible)
  },
  async updateEvents ({ commit }, page) {
    const [month, year] = [moment().month(), moment().year()]
    const in_past = page.year < year || (page.year === year && page.month <= month)
    // commit('setPast', in_past)
    const start_datetime = moment().year(page.year).month(page.month - 1).startOf('month').startOf('week').unix()
    const query = `start=${start_datetime}`
    const events = await this.$axios.$get(`/event?${query}`)
    commit('setEvents', events)
    commit('showPastEvents', in_past)
  },
  async updateMeta ({ commit }) {
    const { tags, places } = await this.$axios.$get('/event/meta')
    commit('update', { tags, places })
  },
  async addEvent ({ commit }, formData) {
    const event = await this.$axios.$post('/user/event', formData)
    if (event.user) {
      commit('addEvent', event)
    }
  },
  async updateEvent ({ commit }, formData) {
    const event = await this.$axios.$put('/user/event', formData)
    if (event.user) {
      commit('updateEvent', event)
    }
  },
  delEvent ({ commit }, eventId) {
    commit('delEvent', eventId)
  },
  setSearchTags ({ commit }, tags) {
    commit('setSearchTags', tags)
  },
  setSearchPlaces ({ commit }, places) {
    commit('setSearchPlaces', places)
  },
  showPastEvents ({ commit }, show) {
    commit('showPastEvents', show)
  },
  showRecurrentEvents ({ commit }, show) {
    commit('showRecurrentEvents', show)
  },
  async setSetting ({ commit }, setting) {
    await this.$axios.$post('/settings', setting)
    commit('setSetting', setting)
  }
}
