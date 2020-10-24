export const state = () => ({
  locale: '',
  user_locale: {},
  filters: { tags: [], places: [] },
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
    hide_boosts: true,
    enable_trusted_instances: true,
    trusted_instances: []
  },
  announcements: []
})

export const mutations = {
  // setEvents (state, events) {
  //   // set`past` and `newDay` flags to event
  //   let lastDay = null
  //   state.events = events.map(e => {
  //     const currentDay = dayjs.unix(e.start_datetime).date()
  //     e.newDay = (!lastDay || lastDay !== currentDay) && currentDay
  //     lastDay = currentDay
  //     const end_datetime = e.end_datetime || e.start_datetime + 3600 * 2
  //     const past = ((dayjs().unix()) - end_datetime) > 0
  //     e.past = !!past
  //     return e
  //   })
  // },
  update (state, { tags, places }) {
    state.tags = tags
    state.places = places
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
  setFilters (state, filters) {
    state.filters.tags = [...filters.tags]
    state.filters.places = [...filters.places]
  },
  setAnnouncements (state, announcements) {
    state.announcements = announcements
  }
}

export const actions = {
  // this method is called server side only for each request for nuxt
  // we use it to get configuration from db, set locale, etc...
  nuxtServerInit ({ commit }, { req }) {
    commit('setSettings', req.settings)
    commit('setAnnouncements', req.announcements)
    commit('update', req.meta)
  },
  async updateAnnouncements ({ commit }) {
    const announcements = await this.$axios.$get('/announcements')
    commit('setAnnouncements', announcements)
  },
  async updateMeta ({ commit }) {
    const { tags, places } = await this.$axios.$get('/event/meta')
    commit('update', { tags, places })
  },
  async addEvent ({ commit }, formData) {
    await this.$axios.$post('/event', formData)
  },
  async updateEvent ({ commit }, formData) {
    await this.$axios.$put('/event', formData)
  },
  setFilters ({ commit }, filters) {
    commit('setFilters', filters)
  },
  setAnnouncements ({ commit }, announcements) {
    commit('setAnnouncements', announcements)
  },
  delEvent ({ commit }, eventId) {
    commit('delEvent', eventId)
  },
  async setSetting ({ commit }, setting) {
    await this.$axios.$post('/settings', setting)
    commit('setSetting', setting)
  }
}
