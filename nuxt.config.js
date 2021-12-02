const config = require('./server/config.js')

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
    script: [{ src: '/gancio-events.es.js' }],
    link: [{ rel: 'icon', type: 'image/png', href: '/logo.png' }]
  },
  dev: (process.env.NODE_ENV !== 'production'),
  server: config.server,


  vue: {
    config: {
      ignoredElements: ['gancio-events']
    }
  },

  /*
   ** Customize the progress-bar component
   */
  loading: '~/components/Loading.vue',
  /*
   ** Global CSS
   */
  css: [
    'vuetify/dist/vuetify.min.css', 
    '@mdi/font/css/materialdesignicons.css',
    '@/assets/style.less'
  ],

  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    '@/plugins/i18n.js',
    '@/plugins/filters', // text filters, datetime filters, generic transformation helpers etc.
    '@/plugins/vuetify', // vuetify
    '@/plugins/axios', // axios baseurl configuration
    '@/plugins/validators', // inject validators
    '@/plugins/api', // api helpers
    { src: '@/plugins/v-calendar', ssr: false } // v-calendar
  ],

  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    '@nuxtjs/auth',
    '@/server/initialize.server.js'
  ],

  serverMiddleware: ['server/routes'],

  /*
   ** Axios module configuration
   * See https://github.com/nuxt-community/axios-module#options
   */
  axios: {
    prefix: '/api'
  },
  auth: {
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
          user: { url: '/user', method: 'get', propertyName: false }
        },
        tokenRequired: true,
        tokenType: 'Bearer'
      }
    }
  },
  build: {
    corejs: 3,
    cache: true,
    hardSource: true
  },
}
