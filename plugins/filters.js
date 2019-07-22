import Vue from 'vue'
import moment from 'dayjs'
import 'dayjs/locale/it'

export default ({ app, store }) => {

  // replace links with anchors
  // TODO: remove fb tracking id
  Vue.filter('linkify', value => value.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1">$1</a>'))

  // Vue.filter('datetime', value => moment(value).locale(store.state.locale).format('ddd, D MMMM HH:mm'))
  // Vue.filter('short_datetime', value => moment(value).locale(store.state.locale).format('D/MM HH:mm'))
  // Vue.filter('hour', value => moment(value).locale(store.state.locale).format('HH:mm'))

  // shown in mobile homepage
  Vue.filter('day', value => moment(value).locale(store.state.locale).format('dddd, D MMMM'))
  // Vue.filter('month', value => moment(value).locale(store.state.locale).format('MMM'))

  // format event start/end datetime based on page
  Vue.filter('when', (event, where) => {
    moment.locale(store.state.locale)

    //{start,end}_datetime are unix timestamp
    const start = moment(event.start_datetime)
    const end = moment(event.end_datetime)

    const normal = `${start.format('dddd, D MMMM (HH:mm-')}${end.format('HH:mm)')}`

    // recurrent event
    if (event.recurrent && where !== 'home') {
      const { frequency, days, type } = JSON.parse(event.recurrent)
      if ( frequency === '1w' || frequency === '2w' ) {
        const recurrent = app.i18n.tc(`event.recurrent_${frequency}_days`, days.length, {days: days.map(d => moment().day(d-1).format('dddd'))})
        return `${normal} - ${recurrent}`
      } else if (frequency === '1m' || frequency === '2m') {
        const d = type === 'ordinal' ? days : days.map(d => moment().day(d-1).format('dddd'))
        const recurrent = app.i18n.tc(`event.recurrent_${frequency}_${type}`, days.length, {days: d})
        return `${normal} - ${recurrent}`
      }
      return 'recurrent '
    }

    // multidate
    if (event.multidate) {
      return `${start.format('ddd, D MMMM (HH:mm)')} - ${end.format('ddd, D MMMM')}`
    } 

    // normal event
    if (event.end_datetime && event.end_datetime !== event.start_datetime) {
      return `${start.format('ddd, D MMMM (HH:mm-')}${end.format('HH:mm)')}`
    }
    return start.format('dddd, D MMMM (HH:mm)')
  })
}
