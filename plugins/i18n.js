import Vue from 'vue'
import VueI18n from 'vue-i18n'
import merge from 'lodash/merge'

Vue.use(VueI18n)

export default async ({ app, store, req }) => {
  const messages = {}
  if (process.server) {
    store.commit('setLocale', req.acceptedLocale)
    if (req.user_locale) {
      store.commit('setUserLocale', req.user_locale)
    }
  }

  messages[store.state.locale] = await import(/* webpackChunkName: "lang-[request]" */`../locales/${store.state.locale}.json`)

  // always include en fallback locale
  if (store.state.locale !== 'en') {
    messages.en = await import('../locales/en.json')
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
