import Vue from 'vue'
import VueI18n from 'vue-i18n'
import merge from 'lodash/merge'
import locales from '../locales'

Vue.use(VueI18n)

export default async ({ app, store }) => {
  // Set i18n instance on app
  // This way we can use it in middleware and pages asyncData/fetch

  const user_locale = await app.$axios.$get('/settings/user_locale')
  for (const lang in user_locale) {
    if (locales[lang]) { merge(locales[lang], user_locale[lang]) }
  }

  app.i18n = new VueI18n({
    locale: store.state.locale,
    fallbackLocale: 'it',
    messages: locales
  })
}
