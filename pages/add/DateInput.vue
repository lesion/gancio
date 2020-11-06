<template lang="pug">
v-row
    v-menu(
      v-model="datePickerMenu"
      :close-on-content-click="false"
      :nudge-right="40"
      transition="scale-transition"
      offset-y
      min-width="290px"
    )
      template(v-slot:activator="{ on, attrs }")
        v-text-field.col-md-8(
          :value='value.date'
          :label="$t('common.when')"
          :rules="[$validators.required('common.when')]"
          prepend-icon='mdi-calendar'
          readonly
          v-bind="attrs"
          v-on="on")
      v-date-picker(
        :min='today'
        v-model="value.date"
        :range="type === 'multidate'"
        :locale='settings.locale'
        @input="pick")

    v-btn-toggle.col-md-4(@change='changeType' color='primary' :value='type')
      v-btn(value='normal') {{$t('event.normal')}}
      v-btn(value='multidate') {{$t('event.multidate')}}
      v-menu(v-if='settings.allow_recurrent_event' offset-y open-on-hover)
        template(v-slot:activator="{ on, attrs }")
          v-btn(value='recurrent' v-on='on') {{$t('event.recurrent')}}
        v-list
          v-list-item(v-for='f in frequencies' :key='f.value'
            @click='selectFrequency(f.value)') {{f.text}}

    //- //- p.col-12 {{$t(`event.${type}_description`)}}
    //- v-btn-toggle(v-if="type === 'recurrent'" v-model='recurrent.frequency' color='primary')
    //-   v-btn(v-for='f in frequencies' :value='f.value') {{f.text}}

    //- .datePicker
    //-   v-date-picker(
    //-     :mode='datePickerMode'
    //-     v-model='date'
    //-     :rules="[$validators.required('event.when')]"
    //-     :locale='$i18n.locale'
    //-     :is-dark="settings['theme.is_dark']"
    //-     is-inline
    //-     is-expanded
    //-     :min-date='type !== "recurrent" && new Date()')

    div.text-center.mb-2(v-if='type === "recurrent"')
      span(v-if='recurrent.frequency !== "1m" && recurrent.frequency !== "2m"') {{whenPatterns}}
      v-btn-toggle.mt-1(v-else v-model='recurrent.type' color='primary')
        v-btn(v-for='whenPattern in whenPatterns' :value='whenPattern.key' :key='whenPatterns.key' small)
          span {{whenPattern.label}}

    //- List(v-if='type==="normal" && todayEvents.length' :events='todayEvents' :title='$t("event.same_day")')

</template>
<script>
// import VInput from 'vuetify/es5/components/VInput'
import dayjs from 'dayjs'
import { mapState } from 'vuex'
import List from '@/components/List'

export default {
  name: 'WhenInput',
  components: { List },
  props: {
    value: { type: Object, default: () => ({ date: null, type: 'normal', recurrent: {} }) }
  },
  data () {
    return {
      date: null,
      datePickerMenu: false,
      today: dayjs().format('YYYY-MM-DD'),
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
      if (!this.date) { return }
      const date = dayjs(this.date)

      const freq = this.recurrent.frequency
      const weekDay = date.format('dddd')
      if (freq === '1w' || freq === '2w') {
        return this.$t(`event.recurrent_${freq}_days`, { days: weekDay })
      } else if (freq === '1m' || freq === '2m') {
        const monthDay = date.format('D')

        const n = Math.floor((monthDay - 1) / 7) + 1

        const patterns = [
          { label: this.$t(`event.recurrent_${freq}_days`, { days: monthDay }), key: 'ordinal' }
          // { label: this.$tc(`event.recurrent_${freq}_ordinal`, { n, days: weekDay }), key: 'weekday' }
        ]

        // if selected day is in last week, propose also this type of selection
        const lastWeek = date.daysInMonth() - monthDay < 7
        if (lastWeek) {
          patterns.push(
            {
              label: this.$t(`event.recurrent_${freq}_ordinal`,
                { n: this.$t('ordinal.-1'), days: weekDay }),
              key: 'weekday'
            }
          )
        }

        if (n < 5) {
          patterns.push(
            {
              label: this.$t(`event.recurrent_${freq}_ordinal`,
                { n: this.$t(`ordinal.${n}`), days: weekDay }),
              key: 'weekday'
            }
          )
        }
        return patterns
      } else if (freq === '1d') {
        return this.$t('event.recurrent_each_day')
      }
      return ''
    }
    // todayEvents () {
    //   if (this.type === 'multidate') {
    //     if (!this.date || !this.date.start) { return }
    //     const date_start = dayjs(this.date.start)
    //     const date_end = dayjs(this.date.end)
    //     return this.events.filter(e =>
    //       !e.multidate
    //         ? date_start.isSame(dayjs.unix(e.start_datetime), 'day') ||
    //         (date_start.isBefore(dayjs.unix(e.start_dateime)) && date_end.isAfter(dayjs.unix(e.start_datetime)))
    //         : date_start.isSame(dayjs.unix(e.start_datetime), 'day') || date_start.isSame(dayjs.unix(e.end_datetime)) ||
    //         (date_start.isAfter(dayjs.unix(e.start_datetime)) && date_start.isBefore(dayjs.unix(e.end_datetime))))
    //   } else if (this.type === 'recurrent') {
    //     return []
    //   } else {
    //     const date = dayjs(this.date)
    //     return this.events.filter(e =>
    //       !e.multidate
    //         ? !e.recurrent && date.isSame(dayjs.unix(e.start_datetime), 'day')
    //         : dayjs.unix(e.start_datetime).isSame(date, 'day') ||
    //           (dayjs.unix(e.start_datetime).isBefore(date) && dayjs.unix(e.end_datetime).isAfter(date))
    //     )
    //   }
    // },
    // attributes () {
    //   let attributes = []
    //   // attributes.push({ key: 'today', dates: new Date(), highlight: { color: 'red' } })

    //   const date = dayjs(this.date)
    //   const start = date.toDate()
    //   attributes = attributes.concat(this.events
    //     .filter(e => !e.multidate && (!e.parentId || this.type === 'recurrent'))
    //     .map(e => ({ key: e.id, dot: { color: this.type === 'recurrent' ? 'orange' : 'green' }, dates: dayjs.unix(e.start_datetime).toDate() })))

    //   if (this.type === 'recurrent' && this.date && this.date.length) {
    //     let dates = {}
    //     if (this.recurrent.frequency !== '1m') {
    //       dates = {
    //         weeklyInterval: this.recurrent.frequency === '1w' ? 1 : 2,
    //         weekdays: date.day(),
    //         start
    //       }
    //     } else if (this.recurrent.type === 'ordinal') {
    //       const day = date.date()
    //       dates = {
    //         monthlyInterval: 1,
    //         start,
    //         days
    //       }
    //     } else if (this.recurrent.type === 'weekday') {
    //       dates = {
    //         monthlyInterval: 1,
    //         start,
    //         days: [Math.floor((date.day() - 1 / 7) + 1), date.day()]
    //       }
    //     } else {
    //       dates = {
    //         monthlyInterval: 1,
    //         start,
    //         days: [-1, date.day()]
    //       }
    //     }
    //     attributes.push({
    //       key: 'recurrent',
    //       dot: { color: 'orange' },
    //       dates
    //     })
    //   }
    //   attributes = attributes.concat(this.events
    //     .filter(e => e.multidate && !e.parentId)
    //     .map(e => ({
    //       key: e.id,
    //       highlight: {},
    //       dates: { start: dayjs.unix(e.start_datetime).toDate(), end: dayjs.unix(e.end_datetime).toDate() }
    //     })))

    //   return attributes
    // }
  },
  methods: {
    changeType (type) {
      this.date = null
      this.type = type || 'normal'
    },
    selectFrequency (f) {
      this.recurrent.frequency = f
      this.type = 'recurrent'
    },
    pick (value) {
      if (this.type === 'normal' || this.type === 'recurrent' || this.date.length === 2) {
        this.datePickerMenu = false
      }
    }
  }
}
</script>
