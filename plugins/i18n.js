import Vue from 'vue'
import VueI18n from 'vue-i18n'
import it from '../locales/it.js'
import en from '../locales/en.js'
import merge from 'lodash/merge'

Vue.use(VueI18n)

export default async ({ app, store }) => {
  // Set i18n instance on app
  // This way we can use it in middleware and pages asyncData/fetch

  const user_locale = await app.$axios.$get('/settings/user_locale')
  app.i18n = new VueI18n({
    locale: store.state.locale,
    fallbackLocale: 'it',
    messages: {
      it: merge(it, user_locale),
      en: merge(en, user_locale)
    }
  })
}
