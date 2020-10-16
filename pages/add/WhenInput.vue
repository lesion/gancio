<template lang="pug">
.when
  .text-center
    v-btn-toggle(v-model="type" color='primary')
      v-btn(value='normal' label="normal") {{$t('event.normal')}}
      v-btn(value='multidate' label="multidate") {{$t('event.multidate')}}
      v-btn(v-if='settings.allow_recurrent_event' value='recurrent' label="recurrent") {{$t('event.recurrent')}}

    p {{$t(`event.${type}_description`)}}
    v-select(v-if='type==="recurrent"'
      :items="frequencies"
      v-model='recurrent.frequency')
    client-only
      .datePicker
        v-date-picker(
          :mode='datePickerMode'
          :attributes='attributes'
          v-model='date'
          :locale='$i18n.locale'
          :is-dark="settings['theme.is_dark']"
          is-inline
          is-expanded
          :min-date='type !== "recurrent" && new Date()')

  div.text-center.mb-2(v-if='type === "recurrent"')
    span(v-if='recurrent.frequency !== "1m" && recurrent.frequency !== "2m"') {{whenPatterns}}
    v-btn-toggle.mt-1(v-else v-model='recurrent.type' color='primary')
      v-btn(v-for='whenPattern in whenPatterns' :value='whenPattern.key' :key='whenPatterns.key' small)
        span {{whenPattern.label}}

  List(v-if='type==="normal" && todayEvents.length' :events='todayEvents' :title='$t("event.same_day")')

  
</template>
<script>
// import VInput from 'vuetify/es5/components/VInput'
import dayjs from 'dayjs'
import { mapState } from 'vuex'
import List from '@/components/List'

export default {
  name: 'WhenInput',
  components: { List },
  props:{
    value: { type: Object, default: () => ({ type: 'normal', recurrent: {} }) }
  },
  data () {
    return {
      date: null,
      type: 'normal',
      recurrent: { },
      frequencies: [
        { value: '1w', text: this.$t('event.each_week') },
        { value: '2w', text: this.$t('event.each_2w') },
        { value: '1m', text: this.$t('event.each_month') }
      ]
    }
  },
  computed: {
    ...mapState(['settings', 'events']),
    datePickerMode () {
      const modeMap = {
        multidate: 'range',
        normal: 'single',
        recurrent: 'single'
      }
      return modeMap[this.type]
    },
    whenPatterns () {
      if (!this.date) return
      const date = dayjs(this.date)

      const freq = this.recurrent.frequency
      const weekDay = date.day()
      if (freq === '1w' || freq === '2w') {
        return this.$t(`event.recurrent_${freq}_day`, { day: weekDay })
      } else if (freq === '1m' || freq === '2m') {
        const monthDay = date.date()

        const n = Math.floor((monthDay - 1) / 7) + 1

        const patterns = [
          { label: this.$t(`event.recurrent_${freq}_days`, { day: monthDay }), key: 'ordinal' },
          { label: this.$t(`event.recurrent_${freq}_ordinal`, { n, day: weekDay }), key: 'weekday' },
        ]

        // if selected day is in last week, propose also this type of selection
        const lastWeek = date.daysInMonth()-monthDay < 7
        if (lastWeek) {
          patterns.push(
            { label: this.$t(`event.recurrent_${freq}_ordinaldesc`, { n, day: weekDay }), key: 'weekday_desc' }
          )
        }
        return patterns
      } else if (freq === '1d') {
        return this.$t('event.recurrent_each_day')
      }
      return ''
    },
    todayEvents () {
      if (this.type === 'multidate') {
        if (!this.date || !this.date.start) { return }
        const date_start = dayjs(this.date.start)
        const date_end = dayjs(this.date.end)
        return this.events.filter(e =>
          !e.multidate
            ? date_start.isSame(dayjs.unix(e.start_datetime), 'day') ||
            (date_start.isBefore(dayjs.unix(e.start_dateime)) && date_end.isAfter(dayjs.unix(e.start_datetime)))
            : date_start.isSame(dayjs.unix(e.start_datetime), 'day') || date_start.isSame(dayjs.unix(e.end_datetime)) ||
            (date_start.isAfter(dayjs.unix(e.start_datetime)) && date_start.isBefore(dayjs.unix(e.end_datetime))))
      } else if (this.type === 'recurrent') {
        return []
      } else {
        const date = dayjs(this.date)
        return this.events.filter(e =>
          !e.multidate
            ? !e.recurrent && date.isSame(dayjs.unix(e.start_datetime), 'day')
            : dayjs.unix(e.start_datetime).isSame(date, 'day') ||
              (dayjs.unix(e.start_datetime).isBefore(date) && dayjs.unix(e.end_datetime).isAfter(date))
        )
      }
    },
    attributes () {
      let attributes = []
      // attributes.push({ key: 'today', dates: new Date(), highlight: { color: 'red' } })

      const date = dayjs(this.date)
      const start = date.toDate()
      attributes = attributes.concat(this.events
        .filter(e => !e.multidate && (!e.parentId || this.type === 'recurrent'))
        .map(e => ({ key: e.id, dot: { color: this.type === 'recurrent' ? 'orange' : 'green' }, dates: dayjs.unix(e.start_datetime).toDate() })))

      if (this.type === 'recurrent' && this.date && this.date.length) {
        let dates = {}
        if (this.recurrent.frequency !== '1m') {
          dates = {
            weeklyInterval: this.recurrent.frequency === '1w' ? 1 : 2,
            weekdays: date.day(),
            start
          } 
        } else {
          if (this.recurrent.type === 'ordinal') {
            const day = date.date()
            dates = {
              monthlyInterval: 1,
              start,
              days
            }
          } else if (this.recurrent.type === 'weekday') {
            dates = {
              monthlyInterval: 1,
              start,
              days: [Math.floor((date.day() -1 /7)+1), date.day()]
            }
          } else {
            dates = {
              monthlyInterval: 1,
              start,
              days: [-1, date.day()]
            }
          }
        }
        attributes.push({
          key: 'recurrent',
          dot: { color: 'orange' },
          dates
        })
      }
      attributes = attributes.concat(this.events
        .filter(e => e.multidate && !e.parentId)
        .map(e => ({
          key: e.id,
          highlight: {},
          dates: { start: dayjs.unix(e.start_datetime).toDate(), end: dayjs.unix(e.end_datetime).toDate() }
        })))

      return attributes
    }
  },
  methods: {
    dateChanged (value) {
      console.error('date changed', value)
    }
  }
  // extends: VInput
}
</script>