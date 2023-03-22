// import { ca, de, en, es, eu, fr, gl, it, nb, nl, pl, pt, sk, ru, zhHans  } from 'vuetify/lib/locale'
//     lang: { locales: { ca, de, en, es, eu, fr, gl, it, nb, nl, pl, pt, sk, ru, zhHans } },
//     treeShake: true,
//     theme: {
//       options: {
//         customProperties: false,
//         variations: false,
//         minifyTheme,
//       },
//       dark: true,
//       themes: {
//         dark: {
//           primary: '#FF6E40'
//         },
//         light: {
//           primary: '#FF4500'
//         }
//       }
//     },
//     defaultAssets: false
//   },

const minifyTheme = require('minify-css-string').default
import { ca, de, en, es, eu, fr, gl, it, nb, nl, pl, pt, sk, ru, zhHans  } from 'vuetify/es5/locale'

export default ({ res, nuxtState }) => {

  const settings = process.server ? res.locals.settings : nuxtState.state.settings
  
  return {
    lang: { locales: { ca, de, en, es, eu, fr, gl, it, nb, nl, pl, pt, sk, ru, zhHans } },
    treeShake: true,
    theme: {
      options: {
        customProperties: false,
        variations: false,
        minifyTheme,
      },
      dark: settings['theme.is_dark'],
      themes: {
        dark: {
          primary: settings['theme.primary'] || '#FF6E40'
        },
        light: {
          primary: settings['theme.primary'] || '#FF4500'
        }
      }
    },
    defaultAssets: false
  }
}