import Vue from 'vue'
import VCalendar from 'v-calendar'
// import 'v-calendar/lib/v-calendar.min.css'

export default () => {
  Vue.use(VCalendar, {
    firstDayOfWeek: 2
  })
}