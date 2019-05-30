const { SHARED_CONF } = require('./config')

module.exports = {
  mode: 'universal',

  /*
   ** Headers of the page
   */
  head: {
    title: SHARED_CONF.title,
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: SHARED_CONF.description }
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
  },
  
  serverMiddleware: [
    { path: '/api', handler: '@/server/api/index.js' }
  ],

  /*
   ** Customize the progress-bar color
   */
  // loading: { color: '#fff' },

  /*
   ** Global CSS
   */
  css: [
    'bootstrap/dist/css/bootstrap.css',
    'element-ui/lib/theme-chalk/index.css',
  ],
  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    '@/plugins/element-ui', // UI library -> https://element.eleme.io/#/en-US/
    '@/plugins/filters',    // text filters, datetime, etc.
    '@/plugins/i18n',       // localization plugin
    '@/plugins/vue-awesome', // icon
    { src: '@/plugins/v-calendar', ssr: false }, // calendar, TO-REDO
    '@/plugins/initialize'
  ],

  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    '@nuxtjs/auth'
  ],
  /*
   ** Axios module configuration
   */
  axios: {
    baseURL: SHARED_CONF.baseurl + '/api',
    browserBaseURL: SHARED_CONF.baseurl + '/api',
    prefix: '/api',
    // credentials: true
    // See https://github.com/nuxt-community/axios-module#options
  },
  auth: {
    strategies: {
      local: {
        endpoints: {
          login: { url: '/auth/login', method: 'post', propertyName: 'token' },
          logout: false,
          user: { url: '/auth/user', method: 'get', propertyName: false }
        },
      }
    }
  },


  /*
   ** Build configuration
   */
  build: {
    transpile: [/^element-ui/, /^vue-awesome/],
    splitChunks: {
      layouts: true
    }
    /*
     ** You can extend webpack config here
     */
    // extend(config, ctx) {
      // Run ESLint on save
      // if (ctx.isDev && ctx.isClient) {
      //   config.module.rules.push({
      //     enforce: 'pre',
      //     test: /\.(js|vue)$/,
      //     loader: 'eslint-loader',
      //     exclude: /(node_modules)/
      //   })
      // }
    // }
  }
}
