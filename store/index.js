import moment from 'dayjs'
import intersection from 'lodash/intersection'
import map from 'lodash/map'


export const state = () => ({
  events: [],
  user: {},
  locale: 'it',
  logged: false,
  token: '',
  tags: [],
  places: [],
  filters: {
    tags: [],
    places: []
  },
  show_past_events: false,
})

export const getters = {
  token: state => state.token,
  // filter current + future events only
  // plus, filter matches search tag/place

  filteredEvents: (state) => {

    let events = state.events

    // TOFIX: use lodash
    if (state.filters.tags.length || state.filters.places.length){
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

    if (!state.show_past_events) {
      events = events.filter( e => !e.past )
    }

    let lastDay = null
    events = map(events, e => {
      const currentDay = moment(e.start_datetime).date()
      console.log(currentDay)
      e.newDay = (!lastDay || lastDay!==currentDay) && currentDay
      lastDay = currentDay
      return e
    })

    return events
  }
}

export const mutations = {
  setEvents(state, events) {
    // set a `past` flag
    state.events = events.map((e) => {
      const end_datetime = e.end_datetime || moment(e.start_datetime).add('3', 'hour')
      const past = (moment().diff(end_datetime, 'minutes') > 0)
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
  },
  showPastEvents (state, show) {
    state.show_past_events = show
  }
}

export const actions = {
  async updateEvents({ commit }, page) {
    const events = await this.$axios.$get(`/event/${page.month-1}/${page.year}`)
    commit('setEvents', events)
  },
  async updateMeta({ commit }) {
    const { tags, places } = await this.$axios.$get('/event/meta')
    commit('update', { tags, places })
  },
  async addEvent({ commit }, formData) {
    const event = await this.$axios.$post('/user/event', formData) // .addEvent(formData)
    commit('addEvent', event)
  },
  async updateEvent({ commit }, formData) {
    const event = await this.$axios.$put('/user/event', formData)
    commit('updateEvent', event)
  },
  delEvent({ commit }, eventId) {
    commit('delEvent', eventId)
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
  },
  showPastEvents({ commit }, show) {
    commit('showPastEvents', show)
  }
}
