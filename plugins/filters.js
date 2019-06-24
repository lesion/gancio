import Vue from 'vue'
import moment from 'dayjs'
import 'dayjs/locale/it'

export default ({ app, store }) => {
  moment.locale(store.state.locale)
  Vue.filter('linkify', value => value.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1">$1</a>'))
  Vue.filter('datetime', value => moment(value).format('ddd, D MMMM HH:mm'))
  Vue.filter('short_datetime', value => moment(value).format('D/MM HH:mm'))
  Vue.filter('hour', value => moment(value).format('HH:mm'))
  Vue.filter('day', value => moment(value*1000).format('dddd, D MMMM'))
  Vue.filter('month', value => moment(value).format('MMM'))
  Vue.filter('event_when', event => {
    
    const start = moment(event.start_datetime*1000)
    const end = moment(event.end_datetime*1000)
    if (event.multidate) {
      return `${start.format('ddd, D MMMM (HH:mm)')} - ${end.format('ddd, D MMMM (HH:mm)')}`
    } else if (event.end_datetime && event.end_datetime !== event.start_datetime)
        return `${start.format('ddd, D MMMM (HH:mm-')}${end.format('HH:mm)')}`
      else
        return start.format('dddd, D MMMM (HH:mm)')
  })
}
