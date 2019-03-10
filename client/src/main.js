import Vue from 'vue'
import VueI18n from 'vue-i18n'
import BootstrapVue from 'bootstrap-vue'
import VCalendar from 'v-calendar'

import 'vue-awesome/icons/lock'
import 'vue-awesome/icons/user'
import 'vue-awesome/icons/plus'
import 'vue-awesome/icons/cog'
import 'vue-awesome/icons/tools'
import 'vue-awesome/icons/file-export'
import 'vue-awesome/icons/sign-out-alt'
import 'vue-awesome/icons/clock'
import 'vue-awesome/icons/map-marker-alt'
import 'vue-awesome/icons/file-alt'
import 'vue-awesome/icons/image'
import 'vue-awesome/icons/tag'
import 'vue-awesome/icons/users'
import 'vue-awesome/icons/calendar'
import 'vue-awesome/icons/edit'
import 'vue-awesome/icons/envelope-open-text'

import Icon from 'vue-awesome/components/Icon'

import VueClipboard from 'vue-clipboard2'

import 'v-calendar/lib/v-calendar.min.css'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import { Button, Select, Tag, Option, Table, FormItem, Card,
  Form, Tabs, TabPane, Switch, Input, Loading, TimeSelect,
  TableColumn, ColorPicker, Pagination } from 'element-ui'
import ElementLocale from 'element-ui/lib/locale'
import MagicGrid from 'vue-magic-grid'

import 'element-ui/lib/theme-chalk/index.css'

import itElementLocale from 'element-ui/lib/locale/lang/it'
import enElementLocale from 'element-ui/lib/locale/lang/en'

import App from './App.vue'
import router from './router'
import store from './store'

import './assets/main.css'

import itLocale from '@/locale/it'
import enLocale from '@/locale/en'

Vue.use(Button)
Vue.use(Card)
Vue.use(Select)
Vue.use(Tag)
Vue.use(Input)
Vue.use(Tabs)
Vue.use(TabPane)
Vue.use(Option)
Vue.use(Switch)
Vue.use(ColorPicker)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Pagination)
Vue.use(FormItem)
Vue.use(Form)
Vue.use(TimeSelect)
Vue.use(Loading.directive)

Vue.use(MagicGrid)

// Use v-calendar, v-date-picker & v-popover components
Vue.use(VCalendar, {
  firstDayOfWeek: 2
})
Vue.use(BootstrapVue)
Vue.use(VueI18n)
Vue.use(VueClipboard)
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

// Vue.use(ElementUI, { i18n: (key, value) => i18n.t(key, value) })

Vue.config.productionTip = false
Vue.config.lang = 'it'
// Vue.locale('en', enLocale)
Vue.config.devtools = true
Vue.config.silent = false
ElementLocale.i18n((key, value) => i18n.t(key, value))
new Vue({
  i18n,
  router,
  store,
  render: h => h(App)
}).$mount('#app')
