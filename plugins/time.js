import { DateTime, Settings } from 'luxon'
export default ({ app, store }, inject) => {
  const zone = Settings.defaultZoneName = store.state.settings.instance_timezone
  Settings.defaultLocale = app.i18n.locale || store.state.settings.instance_locale
  const time = {

    timeFormat () {
      const time = DateTime.fromObject({ hour: 14 }, {
        zone: store.state.settings.instance_timezone,
        locale: app.i18n.locale || store.state.settings.instance_locale
      }).toLocaleString({ hour: 'numeric'})
      return time === '2 PM' ? 'ampm' : '24hr'
    },

    formatHour (value, format) {
      return DateTime.fromFormat(value, 'HH:mm', {
        zone: store.state.settings.instance_timezone,
        locale: app.i18n.locale || store.state.settings.instance_locale
      }).toLocaleString({ hour: '2-digit', minute: '2-digit'})
    },

    format (date, format) {
      return DateTime.fromISO(date, {
        zone: store.state.settings.instance_timezone,
        locale: app.i18n.locale || store.state.settings.instance_locale
      }).toFormat(format || '')
    },

    unixFormat (timestamp, format='EEEE d MMMM HH:mm') {
      return DateTime.fromSeconds(timestamp, {
        zone: store.state.settings.instance_timezone,
        locale: app.i18n.locale || store.state.settings.instance_locale
      }).toFormat(format)
    },

    fromUnix (timestamp) {
      return DateTime.fromSeconds(timestamp, { zone })
    },

    fromDateInput (date, time) {
      const [hour, minute] = time.split(':')
      return DateTime.fromJSDate(date, { zone })
        .set({ hour: Number(hour), minute: Number(minute), second: 0 })
        .toUnixInteger()
    },

    currentMonth () {
      return DateTime.local({ zone }).month
    },

    currentYear () {
      return DateTime.local({ zone }).year
    },

    when (event) {
      const currentYear = app.$time.currentYear()

      const opt = {
        zone: store.state.settings.instance_timezone,
        locale: app.i18n.locale || store.state.settings.instance_locale
      }
      
      const start = DateTime.fromSeconds(event.start_datetime, opt)
      let time = start.toLocaleString({ weekday: 'long', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })
      const end = event.end_datetime && DateTime.fromSeconds(event.end_datetime, opt)
      
      if (end) {
        time += event.multidate ? ` → ${end.toLocaleString({ weekday: 'long', month: 'short', day: '2-digit'})}` : `-${end.toLocaleString({hour: '2-digit', minute: '2-digit'})}`
      }

      if (currentYear !== start.year) {
        time += ` (${start.year})`
      }
      return time
    },

    nowUnix () {
      const opt = {
        zone,
        locale: app.i18n.locale || store.state.settings.instance_locale
      }      
      return DateTime.local(opt).toUnixInteger()
    },

    startMonth () { return DateTime.local({ zone }).startOf('month').toUnixInteger() },
    startOfDay (date) { return DateTime.fromJSDate(date, { zone }).startOf('day').toUnixInteger()},
    endOfDay (date) { return DateTime.fromJSDate(date, { zone }).endOf('day').toUnixInteger()},


    recurrentDetail (event) {
      const parent = event.parent
      if (!parent.recurrent || !parent.recurrent.frequency) return 'error!'
      const { frequency, type } = parent.recurrent
      let recurrent
      if (frequency === '1w' || frequency === '2w') {
        recurrent = app.i18n.t(`event.recurrent_${frequency}_days`, { days: DateTime.fromSeconds(parent.start_datetime).toLocaleString('EEEE') })
      } else if (frequency === '1m' || frequency === '2m') {
        const d = type === 'ordinal' ? DateTime.fromSeconds(parent.start_datetime).day : DateTime.fromSeconds(parent.start_datetime).toLocaleString('EEEE')
        if (type === 'ordinal') {
          recurrent = app.i18n.t(`event.recurrent_${frequency}_days`, { days: d })
        } else {
          recurrent = app.i18n.t(`event.recurrent_${frequency}_ordinal`,
          { n: app.i18n.t('ordinal.' + type), days: d })
        }
      }
      return recurrent
    },

    currentTimestamp () {
      return DateTime.local().toUnixInteger()
    },

    from (timestamp) {
      const opt = {
        zone: store.state.settings.instance_timezone,
        locale: app.i18n.locale || store.state.settings.instance_locale
      }
      return DateTime.fromSeconds(timestamp, opt).toRelative()
    },
    
    /**
     * @description build v-calendar attributes
     * @link https://vcalendar.io/attributes.html
     */
    attributesFromEvents(events) {
      const attributes = []
      const opt = {
        zone: store.state.settings.instance_timezone,
        locale: app.i18n.locale || store.state.settings.instance_locale
      }
      const now = DateTime.local(opt).toUnixInteger()
      for (const e of events) {
        const tmp = DateTime.fromSeconds(e.start_datetime, opt)
        const start = DateTime.local().set({ year: tmp.year, month: tmp.month, day: tmp.day })
        // merge events with same date
        const key = `${start.month}${start.day}`
        const c = (e.end_datetime || e.start_datetime) < now ? 'vc-past' : ''
        
        if (e.multidate === true && e.end_datetime) {
          attributes.push({
            dates: { start: start.toJSDate(), end: DateTime.fromSeconds(e.end_datetime).toJSDate() },
            highlight: {
              start: { fillMode: 'outline' },
              base: { fillMode: 'light' },
              end: { fillMode: 'outline' },
            }
          })
          continue
        }
        
        const i = attributes.find(a => a.day === key)
        if (!i) {
          attributes.push({
            day: key,
            key: e.id, n: 1,
            dates: start.toJSDate(),
            dot: { color: 'teal', class: c }
          })
          continue
        }
        
        i.n++
        if (i.n >= 20) {
          i.dot = { color: 'purple', class: c }
        } else if (i.n >= 10) {
          i.dot = { color: 'red', class: c }
        } else if (i.n >= 5) {
          i.dot = { color: 'orange', class: c }
        } else if (i.n >= 3) {
          i.dot = { color: 'yellow', class: c }
        } else {
          i.dot = { color: 'teal', class: c }
        }
        
      }
      // add a bar to highlight today
      attributes.push({ key: 'today', dates: new Date(), highlight: { color: 'green', fillMode: 'outline' }})
      
      return attributes
    }
  }

  
  inject('time', time)
}
