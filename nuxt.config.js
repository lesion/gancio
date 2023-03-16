const config = require('./server/config.js')
const minifyTheme = require('minify-css-string').default
const locales = require('./locales/index')

import { ca, de, en, es, eu, fr, gl, it, nb, nl, pl, pt, sk, ru, zhHans  } from 'vuetify/lib/locale'

const isDev = (process.env.NODE_ENV !== 'production')
module.exports = {
  telemetry: false,
  modern: (process.env.NODE_ENV === 'production') && 'client',
  /*
   ** Headers of the page
   */
  head: {
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ],
    script: [{ src: '/gancio-events.es.js', async: true, body: true }],
  },
  dev: isDev,
  server: config.server,


  vue: {
    config: {
      ignoredElements: ['gancio-events', 'gancio-event']
    }
  },

  css: ['./assets/style.css'],

  /*
   ** Customize the progress-bar component
   */
  loading: {
    color: 'orangered',
    height: '3px'
  }, //'~/components/Loading.vue',
  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    '@/plugins/filters', // text filters, datetime filters, generic transformation helpers etc.
    '@/plugins/axios', // axios baseurl configuration
    '@/plugins/validators', // inject validators
    '@/plugins/api', // api helpers
    '@/plugins/i18n',
    { src: '@/plugins/v-calendar', ssr: false } // v-calendar
  ],

  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/i18n',
    '~/modules/axios-proxy.js', // Note: import this before @nuxtjs/axios to override defaults of both instances: `$axios` available in context, and `axios` used in controllers
    '@nuxtjs/axios',
    '@nuxtjs/auth',
    '@nuxtjs/sitemap',
    ['cookie-universal-nuxt', { alias: 'cookies' }],
  ],

  sitemap: {
    hostname: config.baseurl,
    gzip: true,
    exclude: [
      '/Admin',
      '/settings',
      '/export',
      '/setup'
    ],
    routes: async () => {
      if (config.status === 'READY') {
        try {
          const Event = require('./server/api/models/event')
          const events = await Event.findAll({ where: { is_visible: true } })
          return events.map(e => `/event/${e.slug}`)
        } catch (e) {
          return []
        }
      } else {
        return []
      }
    }
  },
  i18n: {
    locales: Object.keys(locales).map(key => ({
      code: key,
      name: locales[key],
      file: `${key}.json`,
      file: 'loader.js',
      iso: key
    })),
    vueI18n: {
      fallbackLocale: 'en',
      silentTranslationWarn: true
    },    
    langDir: 'locales',
    lazy: true,
    strategy: 'no_prefix',
    skipSettingLocaleOnNavigate: true,
  },

  serverMiddleware: ['server/routes'],

  /*
   ** Axios module configuration
   * See https://github.com/nuxt-community/axios-module#options
   */
  axios: {
    prefix: '/api'
  },
  auth: {
    rewriteRedirects: true,
    fullPathRedirect: true,
    // localStorage: false, // https://github.com/nuxt-community/auth-module/issues/425
    cookie: {
      prefix: 'auth.',
      options: {
        maxAge: 60 * 60 * 24 * 30 * 12 * 5
      }
    },
    strategies: {
      local: {
        endpoints: {
          login: {
            url: '../oauth/login',
            method: 'post',
            propertyName: 'access_token',
            withCredentials: true,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
          },
          logout: false,
          user: { url: '/user', method: 'get', propertyName: false, autoFetch: false }
        },
        tokenRequired: true,
        tokenType: 'Bearer'
      }
    }
  },
  buildModules: ['@nuxtjs/vuetify'],
  vuetify: {
    lang: { locales: { ca, de, en, es, eu, fr, gl, it, nb, nl, pl, pt, sk, ru, zhHans } },
    treeShake: true,
    theme: {
      options: {
        customProperties: false,
        variations: false,
        minifyTheme,
      },
      dark: true,
      themes: {
        dark: {
          primary: '#FF6E40'
        },
        light: {
          primary: '#FF4500'
        }
      }
    },
    defaultAssets: false
  },
  build: {
    extend(config, { isDev, isClient }) {
      // ..
      config.module.rules.push({
        test: /\.mjs$/,
        include: /node_modules/,
        type: "javascript/auto"
      })
      // Sets webpack's mode to development if `isDev` is true.
      if (isDev) {
        config.mode = 'development'
      }
    },
    corejs: 3,
    cache: true,
    hardSource: !isDev,
    extractCSS: !isDev,
    optimizeCSS: !isDev
  },
}
