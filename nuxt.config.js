const conf = require('config')

module.exports = {
  telemetry: false,
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
  loading: { color: 'orange', height: '5px' },
  /*
   ** Global CSS
   */
  css: [
    '@mdi/font/css/materialdesignicons.css'
  // 'bootstrap/dist/css/bootstrap.min.css',
  // 'element-ui/lib/theme-chalk/index.css',
  // 'element-ui/lib/theme-chalk/display.css',
  // '@/assets/theme/index.css'
  // '@/assets/style.less'
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
    '@/plugins/api' // api helpers
    // { src: '@/plugins/v-calendar', ssr: false } // calendar, fix ssr
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
    ['nuxt-express-module', { expressPath: 'server/', routesPath: 'server/routes' }],
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    '@nuxtjs/auth'
  ],
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
    optimization: {
      minimize: true,
      namedModules: true,
      namedChunks: true,
      splitChunks: {
        name: true,
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            enforce: true,
            name (module) {
              // get the name. E.g. node_modules/packageName/not/this/part.js
              // or node_modules/packageName
              const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1]
              // npm package names are URL-safe, but some servers don't like @ symbols
              return `npm.${packageName.replace('@', '')}`
            }
          }
        }
      }
    },
    transpile: [/^element-ui/, /^vue-awesome/, /^@nuxt/],
    splitChunks: {
      layouts: true
    },
    cache: true
  }
}
