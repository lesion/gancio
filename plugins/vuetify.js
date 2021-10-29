import Vue from 'vue'
import VueClipboard from 'vue-clipboard2'
import Vuetify from 'vuetify'

// import it from 'vuetify/lib/locale/it.js'
// import en from 'vuetify/lib/locale/en.js'
// import es from 'vuetify/lib/locale/es'
// import no from 'vuetify/lib/locale/no'
// import fr from 'vuetify/lib/locale/fr'
// import ca from 'vuetify/lib/locale/ca'


export default ({ app }) => {
  Vue.use(Vuetify)
  Vue.use(VueClipboard)
  app.vuetify = new Vuetify({
    // lang: {
      // locales: { en, it }, //, es, fr, no, ca },
      // current: 'en'
    // },
    icons: {
      iconfont: 'mdi'
    },
    theme: {
      dark: true,
      themes: {
        dark: {
          primary: '#FF6E40'
        },
        light: {
          primary: '#FF4500'
        }
      }      
    }
  })
}