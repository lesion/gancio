export const state = () => ({
  localSettings : {
    hide_thumbs: null,
    'theme.is_dark': null
  },
  settings: {
    instance_timezone: 'Europe/Rome',
    instance_name: '',
    allow_registration: true,
    allow_anon_event: true,
    enable_moderation: false,
    enable_report: false,
    allow_multidate_event: true,
    allow_recurrent_event: true,
    allow_online_event: true,
    allow_geolocation: false,
    recurrent_event_visible: false,
    geocoding_provider_type: '',
    geocoding_provider: '',
    geocoding_countrycodes: [],
    tilelayer_provider: '',
    tilelayer_provider_attribution: '',
    enable_federation: false,
    enable_resources: false,
    hide_boosts: true,
    enable_trusted_instances: true,
    trusted_instances: [],
    trusted_instances_label: '',
    footerLinks: [],
    hide_thumbs: false,
    'theme.is_dark': true,
    hide_calendar: false
  },
  filter: {
    query: '',
    show_recurrent: null,
    show_multidate: null,
  },
  announcements: [],
  collections: [],
  events: []
})

export const getters = {
  hide_thumbs (state) {
    return (![true, false].includes(state.localSettings['hide_thumbs'])) ? state.settings.hide_thumbs : state.localSettings.hide_thumbs
  },
  is_dark (state) {
    return (![true, false].includes(state.localSettings['theme.is_dark'])) ? state.settings['theme.is_dark'] : state.localSettings['theme.is_dark']
  }
}

export const mutations = {
  setSettings (state, settings) {
    state.settings = settings
  },
  setSetting (state, setting) {
    state.settings[setting.key] = setting.value
  },
  setLocalSetting(state, setting) {
    state.localSettings[setting.key] = setting.value
  },
  setAnnouncements (state, announcements) {
    state.announcements = announcements
  },
  setCollections (state, collections) {
    state.collections = collections
  },  
  setEvents (state, events) {
    state.events = Object.freeze(events)
  },
  setFilter (state, { type, value }) {
    state.filter[type] = value
  }
}

export const actions = {
  // this method is called server side only for each request for nuxt
  // we use it to get configuration from db, set locale, etc...
  nuxtServerInit ({ commit }, { res, app }) {
    if (res.locals && res.locals.settings) {
      commit('setSettings', res.locals.settings)
      commit('setFilter', {  type: 'show_recurrent',
          value: res.locals.settings.allow_recurrent_event && res.locals.settings.recurrent_event_visible })
    }

    commit('setLocalSetting', { key: 'hide_thumbs', value: app.$cookies.get('hide_thumbs') })
    commit('setLocalSetting', { key: 'theme.is_dark', value: app.$cookies.get('theme.is_dark') })

    if (res.locals.status === 'READY') {
      commit('setAnnouncements', res.locals.announcements)
      commit('setCollections', res.locals.collections)
      commit('setEvents', res.locals.events)
    }
  },
  async updateAnnouncements ({ commit }) {
    const announcements = await this.$axios.$get('/announcements')
    commit('setAnnouncements', announcements)
  },
  setAnnouncements ({ commit }, announcements) {
    commit('setAnnouncements', announcements)
  },
  setCollections ({ commit }, collections) {
    commit('setCollections', collections)
  },
  async setSetting ({ commit }, setting) {
    await this.$axios.$post('/settings', setting)
    commit('setSetting', setting)
  },
  async setLocalSetting ({ commit }, setting) {
    this.$cookies.set(setting.key, setting.value, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    })
    commit('setLocalSetting', setting)
  },
  setFilter ({ commit }, [type, value]) {
    commit('setFilter', { type, value })
  },
  async getEvents ({ commit, state }, params = {}) {
    try {
      const events = await this.$api.getEvents({
        start: params.start || this.$time.startMonth(),
        end: params.end || null,
        show_recurrent: state.filter.show_recurrent,
        show_multidate: state.filter.show_multidate,
        ...( params.query && { query: params.query }),
        ...( params.older && { older: params.older })
      })
      commit('setEvents', events)
      return events
    } catch (e) {
      console.error('[STORE] getEvent', e)
      commit('setEvents', [])
      return []
    }
  }
}
