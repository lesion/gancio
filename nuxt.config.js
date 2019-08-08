const conf = require('config')

module.exports = {
  mode: 'universal',
  /*
   ** Headers of the page
   */
  head: {
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
  },
  dev: (process.env.NODE_ENV !== 'production'),
  //serverMiddleware: [
    //{ path: '/api', handler: '~/server/api/index.js' }
  //],

  server: conf.server,

  /*
   ** Customize the progress-bar color
   */
  // loading: { color: '#fff' },

  /*
   ** Global CSS
   */
  css: [
    'bootstrap/dist/css/bootstrap.css',
    'element-ui/lib/theme-chalk/index.css'
  ],

  
  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    '@/plugins/element-ui', // UI library -> https://element.eleme.io/#/en-US/
    '@/plugins/filters', // text filters, datetime, etc.
    '@/plugins/vue-awesome', // icon
    '@/plugins/axios', // axios baseurl configuration
    { src: '@/plugins/v-calendar', ssr: false }, // calendar, TO-REDO
    '@/plugins/i18n.js'
  ],

  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    '@nuxtjs/auth',
    ['nuxt-express-module', { expressPath: 'server/', routesPath: 'server/routes' }]
  ],
  /*
   ** Axios module configuration
   * See https://github.com/nuxt-community/axios-module#options
   */
  axios: {
    prefix: '/api'
  },
  router: {
    middleware: 'i18n'
  },
  auth: {
    strategies: {
      local: {
        endpoints: {
          login: { url: '/auth/login', method: 'post', propertyName: 'token' },
          logout: false,
          user: { url: '/auth/user', method: 'get', propertyName: false }
        },
        tokenRequired: false,
        tokenType: 'Bearer'
      }
    }
  },

  /*
   ** Build configuration
   */
  build: {
    // optimization: {
    //   splitChunks: {
    //     cacheGroups: {
    //       element: {
    //         test: /[\\/]node_modules[\\/](element-ui)[\\/]/,
    //         name: 'element-ui',
    //         chunks: 'all'
    //       }
    //     }
    //   }
    // },
    transpile: [/^element-ui/, /^vue-awesome/],
    splitChunks: {
      layouts: true
    },
    cache: true,
  }
}
