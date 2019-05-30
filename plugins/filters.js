import Vue from 'vue'
import moment from 'dayjs'
import 'dayjs/locale/it'
moment.locale('it')

export default (a) => {
  Vue.filter('linkify', value => value.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1">$1</a>'))
  Vue.filter('datetime', value => moment(value).format('ddd, D MMMM HH:mm'))
  Vue.filter('short_datetime', value => moment(value).format('D/MM HH:mm'))
  Vue.filter('hour', value => moment(value).format('HH:mm'))
  Vue.filter('day', value => moment(value).format('ddd, D MMM'))
  Vue.filter('month', value => moment(value).format('MMM'))
  Vue.filter('event_when', event => {
    if (event.multidate) {
      return moment(event.start_datetime).format('ddd, D MMMM HH:mm') + ' - ' + moment(event.end_datetime).format('ddd, D MMMM')
    } else {
      if (event.end_datetime && event.end_datetime !== event.start_datetime)
        return moment(event.start_datetime).format('dddd, D MMMM HH:mm') + '-' + moment(event.end_datetime).format('HH:mm')
      else
        return moment(event.start_datetime).format('dddd, D MMMM HH:mm')
    }
  })
}