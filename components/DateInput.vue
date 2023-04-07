<template lang="pug">
v-col(cols=12)
  .text-center
    v-btn-toggle.v-col-6.flex-column.flex-sm-row(v-if="!event.parentId && !event.recurrent" v-model='type' color='primary' @change='type => change("type", type)')
      v-btn(value='normal' label="normal") {{ $t('event.normal') }}
      v-btn(v-if='settings.allow_multidate_event' value='multidate' label='multidate') {{ $t('event.multidate') }}
      v-btn(v-if='settings.allow_recurrent_event' value='recurrent' label="recurrent") {{ $t('event.recurrent') }}

    p {{ $t(`event.${type}_description`) }}

    v-btn-toggle.v-col-6.flex-column.flex-sm-row(v-if='type === "recurrent"' color='primary' :value='value.recurrent.frequency' @change='fq => change("frequency", fq)')
      v-btn(v-for='f in frequencies' :key='f.value' :value='f.value') {{ f.text }}
    client-only
      .datePicker.mt-3
        v-input(:value='fromDate' :rules="[$validators.required('common.when')]")
          vc-date-picker(
            :value='fromDate'
            :is-range='type === "multidate"'
            @input="date => change('date', date)"
            :attributes='attributes'
            :locale='$i18n.locale'
            :is-dark="is_dark"
            is-inline
            is-expanded
            :min-date='new Date()')
      v-col.calh.text-center(slot='placeholder')
        v-progress-circular(indeterminate color='primary')

  div.text-center.mb-2(v-if='type === "recurrent"')
    span(v-if='value.recurrent.frequency !== "1m" && value.recurrent.frequency !== "2m"') {{ whenPatterns }}
    v-btn-toggle.mt-1.flex-column.flex-sm-row(v-else :value='value.recurrent.type' color='primary' @change='fq => change("recurrentType", fq)')
      v-btn(v-for='whenPattern in whenPatterns' :value='whenPattern.key' :key='whenPatterns.key' small) {{ whenPattern.label }}

  v-row.mt-3.col-md-6.mx-auto
    v-col.col-12.col-sm-6
      v-menu(
        v-model="menuFromHour"
        :close-on-content-click="false"
        offset-y
        :value="value.fromHour"
        transition="scale-transition")
        template(v-slot:activator="{ on, attrs }")
          v-text-field(
            clearable
            :clear-icon='mdiClose'
            @click:clear='() => change("fromHour")'
            :label="$t('event.from')"
            :value="value.fromHour"
            :disabled='!value.from'
            readonly
            :prepend-icon="mdiClockTimeFourOutline"
            :rules="[$validators.required('event.from')]"
            v-bind="attrs"
            v-on="on")
        v-time-picker(
          v-if="menuFromHour"
          :value="value.fromHour"
          :allowedMinutes='allowedMinutes'
          format='24hr'
          @click:minute='menuFromHour = false'
          @input='hr => change("fromHour", hr)')


    v-col.col-12.col-sm-6
      v-menu(
        v-model="menuDueHour"
        :close-on-content-click="false"
        offset-y
        :value="value.dueHour"
        transition="scale-transition")
        template(v-slot:activator="{ on, attrs }")
          v-text-field(
            clearable
            :clear-icon='mdiClose'
            @click:clear='() => change("dueHour")'
            :label="$t('event.due')"
            :value="value.dueHour"
            :disabled='!value.fromHour'
            readonly
            :prepend-icon="mdiClockTimeEightOutline"
            v-bind="attrs"
            v-on="on")
        v-time-picker(
          v-if="menuDueHour"
          :value="value.dueHour"
          :allowedMinutes='allowedMinutes'
          format='24hr'
          @click:minute='menuDueHour = false'
          @input='hr => change("dueHour", hr)')

  List(v-if='type === "normal" && todayEvents.length' :events='todayEvents' :title='$t("event.same_day")')

</template>
<script>
import { DateTime } from 'luxon'
import { mapState, mapActions, mapGetters } from 'vuex'
import List from '@/components/List'
import { mdiClockTimeFourOutline, mdiClockTimeEightOutline, mdiClose } from '@mdi/js'

export default {
  name: 'DateInput',
  components: { List },
  props: {
    value: { type: Object, default: () => ({ from: null, due: null, recurrent: null, fromHour: null, dueHour: null }) },
    event: { type: Object, default: () => null }
  },
  data() {
    return {
      mdiClockTimeFourOutline, mdiClockTimeEightOutline, mdiClose,
      allowedMinutes: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55],
      menuFromHour: false,
      menuDueHour: false,
      type: this.value.type || 'normal',
      frequencies: [
        { value: '1w', text: this.$t('event.each_week') },
        { value: '2w', text: this.$t('event.each_2w') },
        { value: '1m', text: this.$t('event.each_month') }
      ]
    }
  },
  computed: {
    ...mapState(['settings', 'events']),
    ...mapGetters(['is_dark']),
    fromDate () {
      if (this.value.from) {
        if (this.value.multidate) {
          return ({ start: new Date(this.value.from), end: new Date(this.value.due) })
        } else {
          return new Date(this.value.from)
        }
      }
    },
    todayEvents() {
      const start = this.$time.startOfDay(this.value.from)
      const end = this.$time.endOfDay(this.value.from)
      return this.events.filter(e => e.start_datetime >= start && e.start_datetime <= end)
    },
    attributes() {
      return this.$time.attributesFromEvents(this.events.filter(e => e.id !== this.event.id))
    },
    whenPatterns() {
      if (!this.value.from) { return }
      const date = DateTime.fromJSDate(this.value.from)

      const freq = this.value.recurrent.frequency
      const weekDay = date.toFormat('EEEE')
      if (freq === '1w' || freq === '2w') {
        return this.$t(`event.recurrent_${freq}_days`, { days: weekDay }).toUpperCase()
      } else if (freq === '1m' || freq === '2m') {
        const n = Math.floor((date.day) / 7) + 1

        const patterns = [
          { label: this.$t(`event.recurrent_${freq}_days`, { days: date.day }), key: 'ordinal' }
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
        const lastWeek = date.endOf('month').day - date.day < 7
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
  async mounted() {
    if (this.value.multidate) {
      this.type = 'multidate'
    } else if (this.value.recurrent) {
      this.type = 'recurrent'
    } else {
      this.type = 'normal'
    }
    if (!this.events) {
      this.getEvents()
    }
  },
  methods: {
    ...mapActions(['getEvents']),
    updateRecurrent(value) {
      this.$emit('input', { ...this.value, recurrent: value || null })
    },
    change(what, value) {
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
          let due = this.value.multidate ? null : this.value.due
          if (due && due.start) {
            due = due.start
          }
          this.$emit('input', { ...this.value, from, due, recurrent: null, multidate: false })
        }
      } else if (what === 'frequency') {
        if (typeof value === 'undefined') { value = '1w' }
        this.$emit('input', { ...this.value, recurrent: { ...this.value.recurrent, frequency: value } })
      } else if (what === 'recurrentType') {
        this.$emit('input', { ...this.value, recurrent: { ...this.value.recurrent, type: value } })
      } else if (what === 'fromHour') {
        if (value) {
          this.$emit('input', { ...this.value, fromHour: value })
        } else {
          this.$emit('input', { ...this.value, fromHour: null, dueHour: null })
        }
      } else if (what === 'dueHour') {
        if (value) {
          this.value.due = this.value.due ? this.value.due : this.value.from
          const [hour, minute] = value.split(':')
          const [fromHour, fromMinute] = this.value.fromHour.split(':')
          if (!this.value.multidate) {
            if (hour < fromHour) {
              this.value.due = DateTime.fromJSDate(this.value.from, {zone: this.settings.instance_timezone}).plus({day: 1}).toJSDate()
            } else {
              this.value.due = DateTime.fromJSDate(this.value.from, {zone: this.settings.instance_timezone}).toJSDate()
            }
          } else {
            this.value.due = DateTime.fromJSDate(this.value.due, {zone: this.settings.instance_timezone}).set({ hour, minute }).toJSDate()
          }
        } else {
          if (!this.value.multidate) {
            this.value.due = null
          } else {
            this.value.due = DateTime.fromJSDate(this.value.due, {zone: this.settings.instance_timezone}).set({ hour: 23, minute:59 }).toJSDate()
          }
        }
        this.$emit('input', { ...this.value, dueHour: value })

        // change date in calendar (could be a range or a recurrent event...)
      } else if (what === 'date') {
        if (value === null) {
          this.$emit('input', { ...this.value, from: null, due: null, fromHour: null, dueHour: null })
          return
        }
        if (this.value.multidate) {
          let from = value.start
          let due = value.end
          this.$emit('input', { ...this.value, from, due })
        } else {
          let from = value
          let due = this.value.due
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
