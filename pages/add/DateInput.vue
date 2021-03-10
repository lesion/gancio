<template lang="pug">
.when
  .text-center
    v-btn-toggle.v-col-6.flex-column.flex-sm-row(v-model='type' color='primary' @change='type => change("type", type)')
      v-btn(value='normal' label="normal") {{$t('event.normal')}}
      v-btn(value='multidate' label='multidate') {{$t('event.multidate')}}
      v-btn(v-if='settings.allow_recurrent_event' value='recurrent' label="recurrent") {{$t('event.recurrent')}}

    p {{$t(`event.${type}_description`)}}
    //- v-select.col-md-6(v-if='type==="recurrent"'
    //-   :items="frequencies" :value='value.recurrent.frequency' @change='freq => updateRecurrent({...value.recurrent, frequency: freq})')
    v-btn-toggle.v-col-6.flex-column.flex-sm-row(v-if='type === "recurrent"' color='primary' :value='value.recurrent.frequency' @change='fq => change("frequency", fq)')
      v-btn(v-for='f in frequencies' :key='f.value' :value='f.value') {{f.text}}

    client-only
      .datePicker.mt-3
        v-input(:value='fromDate'
            :rules="[$validators.required('common.when')]")
          v-date-picker(
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
    v-btn-toggle.mt-1.flex-column.flex-sm-row(v-else :value='value.recurrent.type' color='primary' @change='fq => change("", fq)')
      v-btn(v-for='whenPattern in whenPatterns' :value='whenPattern.key' :key='whenPatterns.key' small) {{whenPattern.label}}

  v-row.mt-3.col-md-6.mx-auto
    v-col.col-12.col-sm-6
      v-select(dense :label="$t('event.from')" :value='fromHour' clearable
        :rules="[$validators.required('event.from')]"
        :items='hourList' @change='hr => change("fromHour", hr)')

    v-col.col-12.col-sm-6
      v-select(dense :label="$t('event.due')" :value='dueHour' clearable
        :items='hourList' @change='hr => change("dueHour", hr)')

  //- div.col-md-12(v-if='isRecurrent')
  //-   p(v-if='value.recurrent.frequency !== "1m" && value.recurrent.frequency !== "2m"') 🡲 {{whenPatterns}}
  //-   v-btn-toggle(v-else dense group v-model='value.recurrent.type' color='primary')
  //-     v-btn(text link v-for='whenPattern in whenPatterns' :value='whenPattern.key' :key='whenPatterns.key') {{whenPattern.label}}

  List(v-if='type==="normal" && todayEvents.length' :events='todayEvents' :title='$t("event.same_day")')

</template>
<script>
import dayjs from 'dayjs'
import { mapState } from 'vuex'
import List from '@/components/List'
import { attributesFromEvents } from '../../assets/helper'

export default {
  name: 'DateInput',
  components: { List },
  props: {
    value: { type: Object, default: () => ({ from: null, due: null, recurrent: null }) }
  },
  data () {
    return {
      type: 'normal',
      time: { start: null, end: null },
      fromDateMenu: null,
      dueDateMenu: null,
      date: null,
      page: null,
      frequency: '',
      events: [],
      frequencies: [
        { value: '1w', text: this.$t('event.each_week') },
        { value: '2w', text: this.$t('event.each_2w') },
        { value: '1m', text: this.$t('event.each_month') }
      ]
    }
  },
  computed: {
    ...mapState(['settings', 'tags']),
    todayEvents () {
      const start = dayjs(this.value.from).startOf('day').unix()
      const end = dayjs(this.value.from).endOf('day').unix()
      const events = this.events.filter(e => e.start_datetime >= start && e.start_datetime <= end)
      return events
    },
    attributes () {
      return attributesFromEvents(this.events, this.tags)
    },
    fromDate () {
      if (this.value.multidate) {
        return ({ start: dayjs(this.value.from).toDate(), end: dayjs(this.value.due).toDate() })
      }
      return this.value.from ? dayjs(this.value.from).toDate() : null
    },

    fromHour () {
      return this.value.from && this.value.fromHour ? dayjs(this.value.from).format('HH:mm') : null
    },
    dueHour () {
      return this.value.due && this.value.dueHour ? dayjs(this.value.due).format('HH:mm') : null
    },
    hourList () {
      const hourList = []
      const pad = '00'
      for (let h = 0; h < 24; h++) {
        hourList.push(`${(pad + h).slice(-pad.length)}:00`)
        hourList.push(`${(pad + h).slice(-pad.length)}:30`)
      }
      return hourList
    },
    isRecurrent () {
      return !!this.value.recurrent
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
      start: dayjs().unix()
    })
  },
  methods: {
    updateRecurrent (value) {
      this.$emit('input', { ...this.value, recurrent: value || null })
    },
    change (what, value) {
      // change event's type
      if (what === 'type') {
        if (value === 'recurrent') {
          this.$emit('input', { ...this.value, recurrent: {}, multidate: false })
        } else if (value === 'multidate') {
          this.$emit('input', { ...this.value, recurrent: null, multidate: true })
        } else {
          let date = this.value.from
          if (date && date.start) {
            date = date.start
          }
          this.$emit('input', { ...this.value, from: date, due: date, recurrent: null, multidate: false })
        }
      } else if (what === 'frequency') {
        this.$emit('input', { ...this.value, recurrent: { ...this.value.recurrent, frequency: value } })
      } else if (what === 'fromHour') {
        if (value) {
          const [hour, minute] = value.split(':')
          const from = dayjs(this.value.from).hour(hour).minute(minute)
          this.$emit('input', { ...this.value, from, fromHour: true })
        } else {
          this.$emit('input', { ...this.value, fromHour: false })
        }
      } else if (what === 'dueHour') {
        if (value) {
          const [hour, minute] = value.split(':')
          const fromHour = dayjs(this.value.from).hour()

          // add a day
          let due = dayjs(this.value.due)
          if (fromHour > Number(hour) && !this.value.multidate) {
            due = due.add(1, 'day')
          }
          due = due.hour(hour).minute(minute)
          this.$emit('input', { ...this.value, due, dueHour: true })
        } else {
          this.$emit('input', { ...this.value, dueHour: false })
        }
      } else if (what === 'date') {
        console.error('dentro what date', value)
        if (this.value.multidate) {
          let from = value.start
          let due = value.end
          if (this.value.fromHour) {
            from = dayjs(value.start).hour(dayjs(this.value.from).hour())
          }
          if (this.value.dueHour) {
            due = dayjs(value.end).hour(dayjs(this.value.due).hour())
          }
          this.$emit('input', { ...this.value, from, due })
        } else {
          let from = value
          let due = value
          if (this.value.fromHour) {
            from = dayjs(value).hour(dayjs(this.value.from).hour())
          }
          if (this.value.dueHour) {
            due = dayjs(value).hour(dayjs(this.value.due).hour())
          }
          this.$emit('input', { ...this.value, from, due })
        }
      }
    },
    changeType (type) {
      if (type === 'recurrent') {
        this.updateRecurrent({})
      }
    },
    selectFrequency (f) {
      this.$emit('input', { recurrent: { frequency: f }, from: this.value.from, due: this.value.due })
    }
  }
}
</script>

<style lang="less">
.datePicker {
  max-width: 500px !important;
  margin: 0 auto;
}
</style>
