<template lang="pug">
v-col(cols=12)
  .text-center
    v-btn-toggle.v-col-6.flex-column.flex-sm-row(v-model='type' color='primary' @change='type => change("type", type)')
      v-btn(value='normal' label="normal") {{$t('event.normal')}}
      v-btn(value='multidate' label='multidate') {{$t('event.multidate')}}
      v-btn(v-if='settings.allow_recurrent_event' value='recurrent' label="recurrent") {{$t('event.recurrent')}}

    p {{$t(`event.${type}_description`)}}

    v-btn-toggle.v-col-6.flex-column.flex-sm-row(v-if='type === "recurrent"' color='primary' :value='value.recurrent.frequency' @change='fq => change("frequency", fq)')
      v-btn(v-for='f in frequencies' :key='f.value' :value='f.value') {{f.text}}

    client-only
      .datePicker.mt-3
        v-input(:value='fromDate'
            :rules="[$validators.required('common.when')]")
          vc-date-picker(
            :value='fromDate'
            @input="date => change('date', date)"
            :is-range='type === "multidate"'
            :attributes='attributes'
            :locale='$i18n.locale'
            :from-page.sync='page'
            :is-dark="settings['theme.is_dark']"
            is-inline
            is-expanded
            :min-date='type !== "recurrent" && new Date()')

  div.text-center.mb-2(v-if='type === "recurrent"')
    span(v-if='value.recurrent.frequency !== "1m" && value.recurrent.frequency !== "2m"') {{whenPatterns}}
    v-btn-toggle.mt-1.flex-column.flex-sm-row(v-else :value='value.recurrent.type' color='primary' @change='fq => change("recurrentType", fq)')
      v-btn(v-for='whenPattern in whenPatterns' :value='whenPattern.key' :key='whenPatterns.key' small) {{whenPattern.label}}

  v-row.mt-3.col-md-6.mx-auto
    v-col.col-12.col-sm-6
      v-menu(
        v-model="menuFromHour"
        :close-on-content-click="false"
        offset-y
        :value="fromHour"
        transition="scale-transition")
        template(v-slot:activator="{ on, attrs }")
          v-text-field(
            :label="$t('event.from')"
            :value="fromHour"
            :disabled='!value.from'
            :prepend-icon="mdiClockTimeFourOutline"
            :rules="[$validators.required('event.from')]"
            readonly
            v-bind="attrs"
            v-on="on")
        v-time-picker(
          v-if="menuFromHour"
          :value="fromHour"
          :allowedMinutes='allowedMinutes'
          format='24hr'
          @click:minute='menuFromHour=false'
          @change='hr => change("fromHour", hr)')


    v-col.col-12.col-sm-6
      v-menu(
        v-model="menuDueHour"
        :close-on-content-click="false"
        offset-y
        :value="dueHour"
        transition="scale-transition")
        template(v-slot:activator="{ on, attrs }")
          v-text-field(
            :label="$t('event.due')"
            :value="dueHour"
            :disabled='!fromHour'
            :prepend-icon="mdiClockTimeEightOutline"
            :rules="[$validators.required('event.due')]"
            readonly
            v-bind="attrs"
            v-on="on")
        v-time-picker(
          v-if="menuDueHour"
          :value="dueHour"
          :allowedMinutes='allowedMinutes'
          format='24hr'
          @click:minute='menuDueHour=false'
          @change='hr => change("dueHour", hr)')

  List(v-if='type==="normal" && todayEvents.length' :events='todayEvents' :title='$t("event.same_day")')

</template>
<script>
import dayjs from 'dayjs'
import { mapState } from 'vuex'
import List from '@/components/List'
import { attributesFromEvents } from '../assets/helper'
import { mdiClockTimeFourOutline, mdiClockTimeEightOutline  } from '@mdi/js'

export default {
  name: 'DateInput',
  components: { List },
  props: {
    value: { type: Object, default: () => ({ from: null, due: null, recurrent: null }) },
    event: { type: Object, default: () => null }
  },
  data () {
    return {
      mdiClockTimeFourOutline, mdiClockTimeEightOutline,
      allowedMinutes: [0, 15, 30, 45],
      menuFromHour: false,
      menuDueHour: false,
      type: 'normal',
      page: null,
      events: [],
      frequencies: [
        { value: '1w', text: this.$t('event.each_week') },
        { value: '2w', text: this.$t('event.each_2w') },
        { value: '1m', text: this.$t('event.each_month') }
      ]
    }
  },
  computed: {
    ...mapState(['settings']),
    todayEvents () {
      const start = dayjs(this.value.from).startOf('day').unix()
      const end = dayjs(this.value.from).endOf('day').unix()
      return this.events.filter(e => e.start_datetime >= start && e.start_datetime <= end)
    },
    attributes () {
      return attributesFromEvents(this.events)
    },
    fromDate () {
      if (this.value.multidate) {
        return ({ start: dayjs(this.value.from).toDate(), end: dayjs(this.value.due).toDate() })
      }
      return this.value.from ? dayjs(this.value.from).toDate() : null
    },

    fromHour () {
      return this.value.from && this.value.fromHour ? dayjs.tz(this.value.from).format('HH:mm') : null
    },
    dueHour () {
      return this.value.due && this.value.dueHour ? dayjs.tz(this.value.due).format('HH:mm') : null
    },
    whenPatterns () {
      if (!this.value.from) { return }
      const date = dayjs(this.value.from)

      const freq = this.value.recurrent.frequency
      const weekDay = date.format('dddd')
      if (freq === '1w' || freq === '2w') {
        return this.$t(`event.recurrent_${freq}_days`, { days: weekDay }).toUpperCase()
      } else if (freq === '1m' || freq === '2m') {
        const monthDay = date.format('D')
        const n = Math.floor((monthDay - 1) / 7) + 1

        const patterns = [
          { label: this.$t(`event.recurrent_${freq}_days`, { days: monthDay }), key: 'ordinal' }
          // { label: this.$tc(`event.recurrent_${freq}_ordinal`, { n, days: weekDay }), key: 'weekday' }
        ]

        if (n < 5) {
          patterns.push(
            {
              label: this.$t(`event.recurrent_${freq}_ordinal`, { n: this.$t(`ordinal.${n}`), days: weekDay }),
              key: n
            }
          )
        }

        // if selected day is in last week, propose also this type of selection
        const lastWeek = date.daysInMonth() - monthDay < 7
        if (lastWeek) {
          patterns.push(
            {
              label: this.$t(`event.recurrent_${freq}_ordinal`, { n: this.$t('ordinal.-1'), days: weekDay }),
              key: -1
            }
          )
        }

        return patterns
      } else if (freq === '1d') {
        return this.$t('event.recurrent_each_day')
      }
      return ''
    }
  },
  async mounted () {
    if (this.value.multidate) {
      this.type = 'multidate'
    } else if (this.value.recurrent) {
      this.type = 'recurrent'
    } else {
      this.type = 'normal'
    }
    this.events = await this.$api.getEvents({
      start: dayjs().unix(),
      show_recurrent: true
    })
    this.events = this.events.filter(e => e.id !== this.event.id)
  },
  methods: {
    updateRecurrent (value) {
      this.$emit('input', { ...this.value, recurrent: value || null })
    },
    change (what, value) {
      // change event's type
      if (what === 'type') {
        if (typeof value === 'undefined') { this.type = 'normal' }
        if (value === 'recurrent') {
          this.$emit('input', { ...this.value, recurrent: { frequency: '1w' }, multidate: false })
        } else if (value === 'multidate') {
          this.$emit('input', { ...this.value, recurrent: null, multidate: true })
        } else {
          let from = this.value.from
          if (from && from.start) {
            from = from.start
          }
          let due = this.value.due
          if (due && due.start) {
            due = due.start
          }
          this.$emit('input', { ...this.value, from, due, recurrent: null, multidate: false })
        }
      } else if (what === 'frequency') {
        this.$emit('input', { ...this.value, recurrent: { ...this.value.recurrent, frequency: value } })
      } else if (what === 'recurrentType') {
        this.$emit('input', { ...this.value, recurrent: { ...this.value.recurrent, type: value } })
      } else if (what === 'fromHour') {
        if (value) {
          const [hour, minute] = value.split(':')
          const from = dayjs.tz(this.value.from).hour(hour).minute(minute).second(0)
          this.$emit('input', { ...this.value, from, fromHour: true })
        } else {
          this.$emit('input', { ...this.value, fromHour: false })
        }
      } else if (what === 'dueHour') {
        if (value) {
          const [hour, minute] = value.split(':')
          const fromHour = dayjs.tz(this.value.from).hour()

          // add a day
          let due = dayjs(this.value.from)
          if (fromHour > Number(hour) && !this.value.multidate) {
            due = due.add(1, 'day')
          }
          due = due.hour(hour).minute(minute).second(0)
          this.$emit('input', { ...this.value, due, dueHour: true })
        } else {
          this.$emit('input', { ...this.value, due: null, dueHour: false })
        }
      // change date in calendar (could be a range or a recurrent event...)
      } else if (what === 'date') {
        if (value === null) {
          this.$emit('input', { ...this.value, from: null, fromHour: false })
          return
        }
        if (this.value.multidate) {
          let from = value.start
          let due = value.end
          if (this.value.fromHour) {
            from = dayjs.tz(value.start).hour(dayjs.tz(this.value.from).hour())
          }
          if (this.value.dueHour) {
            due = dayjs.tz(value.end).hour(dayjs.tz(this.value.due).hour())
          }
          this.$emit('input', { ...this.value, from, due })
        } else {
          let from = value
          let due = this.value.due
          if (this.value.fromHour) {
            from = dayjs.tz(value).hour(dayjs.tz(this.value.from).hour())
          }
          if (this.value.dueHour && this.value.due) {
            due = dayjs.tz(value).hour(dayjs.tz(this.value.due).hour())
          }
          this.$emit('input', { ...this.value, from, due })
        }
      }
    },
  }
}
</script>

<style>
.datePicker {
  max-width: 500px !important;
  margin: 0 auto;
}
</style>
