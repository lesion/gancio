import Vue from 'vue'
import VueI18n from 'vue-i18n'
import merge from 'lodash/merge'
import messages from '../locales'
// import acceptLanguage from 'accept-language'

Vue.use(VueI18n)

export default ({ app, store, req }) => {
  if (process.server) {
    store.commit('setLocale', req.settings.locale)
    if (req.settings.user_locale) { store.commit('setUserLocale', req.settings.user_locale) }
  }

  if (store.state.user_locale) {
    merge(messages[store.state.locale], store.state.user_locale)
  }

  // Set i18n instance on app
  app.i18n = new VueI18n({
    locale: store.state.locale,
    fallbackLocale: 'en',
    messages
  })
}
