import Vue from 'vue'
import moment from 'dayjs'
import 'dayjs/locale/it'
moment.locale('it')

Vue.filter('datetime', value => moment(value).format('ddd, D MMMM HH:mm'))
Vue.filter('short_datetime', value => moment(value).format('D/MM HH:mm'))
Vue.filter('hour', value => moment(value).format('HH:mm'))
