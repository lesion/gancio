import Vue from 'vue'
import VueI18n from 'vue-i18n'
import merge from 'lodash/merge'
import locales from '../locales'
import acceptLanguage from 'accept-language'

Vue.use(VueI18n)

export default async ({ app, store, req }) => {

  if (process.server) {
    const acceptedLanguages = req.headers['accept-language']
    const supportedLanguages = ['en', 'it', 'es']
    acceptLanguage.languages(supportedLanguages)
    const lang = acceptLanguage.get(acceptedLanguages)
    store.commit('setLocale', lang || 'it')
    
    const user_locale = await app.$axios.$get('/settings/user_locale')
    if (user_locale[store.state.locale]) { store.commit('setUserLocale', user_locale[store.state.locale]) }
  }

  if (store.state.user_locale) {
    merge(locales[store.state.locale], store.state.user_locale)
  }

  // Set i18n instance on app
  app.i18n = new VueI18n({
    locale: store.state.locale,
    fallbackLocale: 'it',
    messages: locales
  })
}
