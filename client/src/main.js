import Vue from 'vue'
import VueI18n from 'vue-i18n'
import BootstrapVue from 'bootstrap-vue'
import VCalendar from 'v-calendar'

import 'vue-awesome/icons'
import Icon from 'vue-awesome/components/Icon'
import Typeahead from '@/components/Typeahead'

import VueClipboard from 'vue-clipboard2'

import 'v-calendar/lib/v-calendar.min.css'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import itElementLocale from 'element-ui/lib/locale/lang/it'
import enElementLocale from 'element-ui/lib/locale/lang/en'

import App from './App.vue'
import router from './router'
import store from './store'

import itLocale from '@/locale/it'
import enLocale from '@/locale/en'

// Use v-calendar, v-date-picker & v-popover components
Vue.use(VCalendar, {
  firstDayOfWeek: 2
})
Vue.use(BootstrapVue)
Vue.use(VueI18n)
Vue.use(VueClipboard)
Vue.component('typeahead', Typeahead)
Vue.component('v-icon', Icon)

const messages = {
  en: {
    ...enElementLocale,
    ...enLocale
  },
  it: {
    ...itElementLocale,
    ...itLocale
  }
}

// Create VueI18n instance with options
const i18n = new VueI18n({
  locale: 'it', // set locale
  messages // set locale messages
})

Vue.use(ElementUI, { i18n: (key, value) => i18n.t(key, value) })

Vue.config.productionTip = false
Vue.config.lang = 'it'
Vue.config.devtools = true
Vue.config.silent = false

new Vue({
  i18n,
  router,
  store,
  render: h => h(App)
}).$mount('#app')
