const conf = require('config')
const { format, transports } = require('winston')

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
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
  },
  dev: (process.env.NODE_ENV !== 'production'),

  server: conf.server,

  /*
   ** Customize the progress-bar color
   */
  loading: '~/components/Loading.vue',
  /*
   ** Global CSS
   */
  css: [
    '@/assets/style.less',
    '@mdi/font/css/materialdesignicons.css'
  ],

  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    '@/plugins/i18n.js',
    '@/plugins/filters', // text filters, datetime filters, generic transformation helpers etc.
    '@/plugins/vue-clipboard', // vuetify
    '@/plugins/axios', // axios baseurl configuration
    '@/plugins/validators', // inject validators
    '@/plugins/api', // api helpers
    { src: '@/plugins/v-calendar', ssr: false } // v-calendar
  ],

  render: {
    compressor: false,
    bundleRenderer: {
      shouldPreload: (file, type) => {
        return ['script', 'style', 'font'].includes(type)
      }
    }
  },
  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    '@nuxtjs/auth',
    ['nuxt-express-module', { expressPath: 'server/', routesPath: 'server/routes' }]
  ],

  // configure nuxt-winston-log module
  winstonLog: {
    skipRequestMiddlewareHandler: true,
    useDefaultLogger: false,
    loggerOptions: {
      transports: process.env.NODE_ENV !== 'production'
        ? [new transports.Console(
            { level: 'debug', format: format.combine(format.colorize(), format.simple(), format.errors({ stack: true })) }
          )]
        : [new transports.File(
            {
              filename: 'logs/gancio.log',
              format: format.combine(format.simple(), format.errors({ stack: true }))
            }
          )]
    }
  },
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

  buildModules: [
    '@nuxtjs/vuetify'
  ],
  vuetify: {
    defaultAssets: false,
    optionsPath: './vuetify.options.js'
    /* module options */
  },
  /*
   ** Build configuration
   */
  build: {
    presets: ['@nuxt/babel-preset-app'],
    babel: {
      plugins: [['@babel/plugin-proposal-private-methods', { loose: true }]],
    },
    cache: true
  }
}
