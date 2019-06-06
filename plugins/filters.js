import Vue from 'vue'
import moment from 'dayjs'
import 'dayjs/locale/it'
moment.locale('it')

function short_hour(datetime) {
  if (datetime.minute() === 0) {
    return 'h' + datetime.format('HH')
  } else {
    return 'h' + datetime.format('HH:mm')
  }
}

export default (a) => {
  Vue.filter('linkify', value => value.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1">$1</a>'))
  Vue.filter('datetime', value => moment(value).format('ddd, D MMMM HH:mm'))
  Vue.filter('short_datetime', value => moment(value).format('D/MM HH:mm'))
  Vue.filter('hour', value => moment(value).format('HH:mm'))
  Vue.filter('day', value => moment(value).format('dddd, D MMMM'))
  Vue.filter('month', value => moment(value).format('MMM'))
  Vue.filter('event_when', event => {
    const start = moment(event.start_datetime)
    const end = moment(event.end_datetime)
    if (event.multidate) {
      return `${start.format('ddd, D MMMM')} (${short_hour(start)}) - ${end.format('ddd, D MMMM')} (${short_hour(end)})`
    } else {
      if (event.end_datetime && event.end_datetime !== event.start_datetime)
        return `${start.format('ddd, D MMMM')} (${short_hour(start)}-${short_hour(end)}`
      else
        return `${start.format('dddd, D MMMM')} (${short_hour(start)})`
    }
  })
}