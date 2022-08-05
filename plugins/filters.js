import Vue from 'vue'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import localizedFormat from 'dayjs/plugin/localizedFormat'

import 'dayjs/locale/it'
import 'dayjs/locale/en'
import 'dayjs/locale/es'
import 'dayjs/locale/ca'
import 'dayjs/locale/pl'
import 'dayjs/locale/eu'
import 'dayjs/locale/nb'
import 'dayjs/locale/fr'
import 'dayjs/locale/de'
import 'dayjs/locale/gl'
import 'dayjs/locale/sk'

dayjs.extend(relativeTime)
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(localizedFormat)

export default ({ app, store }) => {
  // set timezone to instance_timezone!!
  // to show local time relative to event's place
  // not where in the world I'm looking at the page from
  const instance_timezone = store.state.settings.instance_timezone
  const locale = store.state.locale
  dayjs.tz.setDefault(instance_timezone)
  dayjs.locale(locale)

  // replace links with anchors
  // TODO: remove fb tracking id?
  Vue.filter('linkify', value => value.replace(/(https?:\/\/([^\s]+))/g, '<a href="$1">$2</a>'))
  Vue.filter('url2host', url => url.match(/^https?:\/\/(.[^/:]+)/i)[1])
  Vue.filter('datetime', value => dayjs.tz(value).locale(locale).format('ddd, D MMMM HH:mm'))
  Vue.filter('dateFormat', (value, format) => dayjs.tz(value).format(format))
  Vue.filter('unixFormat', (timestamp, format) => dayjs.unix(timestamp).tz().format(format))

  // shown in mobile homepage
  Vue.filter('day', value => dayjs.unix(value).tz().locale(store.state.locale).format('dddd, D MMM'))
  Vue.filter('mediaURL', (event, type, format = '.jpg') => {
    if (event.media && event.media.length) {
      if (type === 'alt') {
        return event.media[0].name
      } else {
        return store.state.settings.baseurl + '/media/' + (type === 'thumb' ? 'thumb/' : '') + event.media[0].url.replace(/.jpg$/, format)
      }
    } else if (type !== 'alt') {
      return store.state.settings.baseurl + '/media/' + (type === 'thumb' ? 'thumb/' : '') + 'logo.svg'
    }
    return ''
  })

  Vue.filter('from', timestamp => dayjs.unix(timestamp).tz().fromNow())

  Vue.filter('recurrentDetail', event => {
    const parent = event.parent
    const { frequency, type } = parent.recurrent
    let recurrent
    if (frequency === '1w' || frequency === '2w') {
      recurrent = app.i18n.t(`event.recurrent_${frequency}_days`, { days: dayjs.unix(parent.start_datetime).tz().format('dddd') })
    } else if (frequency === '1m' || frequency === '2m') {
      const d = type === 'ordinal' ? dayjs.unix(parent.start_datetime).date() : dayjs.unix(parent.start_datetime).tz().format('dddd')
      if (type === 'ordinal') {
        recurrent = app.i18n.t(`event.recurrent_${frequency}_days`, { days: d })
      } else {
        recurrent = app.i18n.t(`event.recurrent_${frequency}_ordinal`,
          { n: app.i18n.t('ordinal.' + type), days: d })
      }
    }
    return recurrent
  })

  Vue.filter('when', (event) => {
    const start = dayjs.unix(event.start_datetime).tz()
    const end = dayjs.unix(event.end_datetime).tz()

    // const normal = `${start.format('dddd, D MMMM (HH:mm-')}${end.format('HH:mm) ')}`
    // // recurrent event
    // if (event.parent && where !== 'home') {
    //   const { frequency, days, type } = event.parent.recurrent
    //   if (frequency === '1w' || frequency === '2w') {
    //     const recurrent = app.i18n.tc(`event.recurrent_${frequency}_days`, days.length, { days: days.map(d => dayjs().day(d - 1).format('dddd')) })
    //     return `${normal} - ${recurrent}`
    //   } else if (frequency === '1m' || frequency === '2m') {
    //     const d = type === 'ordinal' ? days : days.map(d => dayjs().day(d - 1).format('dddd'))
    //     const recurrent = app.i18n.tc(`event.recurrent_${frequency}_${type}`, days.length, { days: d })
    //     return `${normal} - ${recurrent}`
    //   }
    //   return 'recurrent '
    // }

    // multidate
    if (event.multidate) {
      return `${start.format('ddd, D MMM, HH:mm')} - ${end.format('ddd, D MMM, HH:mm')}`
    }

    // normal event
    return `${start.format('dddd, D MMMM, HH:mm')}-${end.format('HH:mm')}`
  })
}
