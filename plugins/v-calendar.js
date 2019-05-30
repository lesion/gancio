import Vue from 'vue'
import VCalendar from 'v-calendar'

export default () => {
  Vue.use(VCalendar, {
    firstDayOfWeek: 2
  })
}