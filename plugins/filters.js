import Vue from 'vue'
import moment from 'moment-timezone'

export default ({ app, store }) => {
  // set timezone to instance_timezone!!
  // to show local time relative to event's place
  // not where in the world I'm looking at the page from
  moment.tz.setDefault(store.state.settings.instance_timezone)
  moment.locale(store.state.locale)

  // replace links with anchors
  // TODO: remove fb tracking id?
  Vue.filter('linkify', value => value.replace(/(https?:\/\/([^\s]+))/g, '<a href="$1">$2</a>'))
  Vue.filter('url2host', url => url.match(/^https?:\/\/(.[^/:]+)/i)[1])
  Vue.filter('datetime', value => moment(value).locale(store.state.locale).format('ddd, D MMMM HH:mm'))
  Vue.filter('dateFormat', (value, format) => moment(value).format(format))
  Vue.filter('unixFormat', (timestamp, format) => moment.unix(timestamp).format(format))

  // shown in mobile homepage
  Vue.filter('day', value => moment.unix(value).locale(store.state.locale).format('dddd, D MMM'))

  Vue.filter('to', timestamp => moment.unix(timestamp).to())
  // format event start/end datetime based on page

  Vue.filter('recurrentDetail', event => {
    const { frequency, days, type } = event.parent.recurrent
    let recurrent
    if (frequency === '1w' || frequency === '2w') {
      recurrent = app.i18n.tc(`event.recurrent_${frequency}_days`, days.length, { days: days.map(d => moment().day(d - 1).format('dddd')) })
    } else if (frequency === '1m' || frequency === '2m') {
      const d = type === 'ordinal' ? days : days.map(d => moment().day(d - 1).format('dddd'))
      recurrent = app.i18n.tc(`event.recurrent_${frequency}_${type}`, days.length, { days: d })
    }
    return recurrent

  })
  Vue.filter('when', (event) => {
    const start = moment.unix(event.start_datetime)
    const end = moment.unix(event.end_datetime)

    // const normal = `${start.format('dddd, D MMMM (HH:mm-')}${end.format('HH:mm) ')}`
    // // recurrent event
    // if (event.parent && where !== 'home') {
    //   const { frequency, days, type } = event.parent.recurrent
    //   if (frequency === '1w' || frequency === '2w') {
    //     const recurrent = app.i18n.tc(`event.recurrent_${frequency}_days`, days.length, { days: days.map(d => moment().day(d - 1).format('dddd')) })
    //     return `${normal} - ${recurrent}`
    //   } else if (frequency === '1m' || frequency === '2m') {
    //     const d = type === 'ordinal' ? days : days.map(d => moment().day(d - 1).format('dddd'))
    //     const recurrent = app.i18n.tc(`event.recurrent_${frequency}_${type}`, days.length, { days: d })
    //     return `${normal} - ${recurrent}`
    //   }
    //   return 'recurrent '
    // }

    // multidate
    if (event.multidate) {
      return `${start.format('ddd, D MMMM HH:mm')} - ${end.format('ddd, D MMMM')}`
    }

    // normal event
    return start.format('ddd, D MMMM HH:mm')
  })
}
