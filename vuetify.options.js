const minifyTheme = require('minify-css-string').default
import { ca, cs, de, en, es, eu, fr, gl, it, nb, nl, pl, pt, tr, sk, ro, ru, zhHans  } from 'vuetify/es5/locale'

export default ({ res, nuxtState }) => {

  const settings = process.server ? (res.locals.settings || {}) : nuxtState.state.settings || {}
  const is_dark = process.client
    ? (typeof nuxtState.state.localSettings['theme.is_dark'] !== 'undefined' ? nuxtState.state.localSettings['theme.is_dark'] : settings['theme.is_dark'])
    : settings['theme.is_dark']

  return {
    lang: { locales: { ca, cs, de, en, es, eu, fr, gl, it, nb, nl, pl, pt, sk, tr, ro, ru, zhHans } },
    theme: {
      options: {
        customProperties: false,
        variations: false,
        minifyTheme,
      },
      dark: is_dark,
      themes: {
        dark: settings.dark_colors,
        light: settings.light_colors
      }
    },
  }
}