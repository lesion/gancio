const minifyTheme = require('minify-css-string').default
import { be, ca, cs, de, en, es, eu, fr, gl, it, nb, nl, pl, pt, tr, sk, sv, ro, ru, zhHans  } from 'vuetify/es5/locale'

export default ({ res, nuxtState }) => {

  const settings = process.server ? (res.locals.settings || {}) : nuxtState.state.settings || {}
  const is_dark = nuxtState?.state?.localSettings['theme.is_dark'] ?? settings['theme.is_dark']

  return {
    lang: { locales: { be, ca, cs, de, en, es, eu, fr, gl, it, nb, nl, pl, pt, sk, sv, tr, ro, ru, zhHans } },
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