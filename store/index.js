export const state = () => ({
  locale: '',
  user_locale: {},
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
    trusted_instances: [],
    footerLinks: []
  },
  announcements: []
})

export const mutations = {
  setSettings (state, settings) {
    state.settings = settings
  },
  setSetting (state, setting) {
    state.settings[setting.key] = setting.value
  },
  setLocale (state, locale) {
    state.locale = locale
  },
  setUserlocale (state, messages) {
    state.user_locale = messages
  },
  setAnnouncements (state, announcements) {
    state.announcements = announcements
  }
}

export const actions = {
  // this method is called server side only for each request for nuxt
  // we use it to get configuration from db, set locale, etc...
  nuxtServerInit ({ commit }, { _req, res }) {
    commit('setSettings', res.locals.settings)
    if (res.locals.status === 'READY') {
      commit('setAnnouncements', res.locals.announcements)
    }
  },
  async updateAnnouncements ({ commit }) {
    const announcements = await this.$axios.$get('/announcements')
    commit('setAnnouncements', announcements)
  },
  setAnnouncements ({ commit }, announcements) {
    commit('setAnnouncements', announcements)
  },
  async setSetting ({ commit }, setting) {
    await this.$axios.$post('/settings', setting)
    commit('setSetting', setting)
  }
}
