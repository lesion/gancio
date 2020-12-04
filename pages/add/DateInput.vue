<template lang="pug">
v-row
  v-date-picker.col-md-6(
    mode='dateTime'
    :input-debounce="200"
    :min='today'
    :minute-increment="5"
    is-dark
    is-expanded
    @input='v => change("from", v)'
    :value="value.from"
    :locale='$i18n.locale')
    template(v-slot="{ inputValue, inputEvents }")
      v-text-field(
        :value='inputValue'
        :label="$t('event.from')"
        :rules="[$validators.required('common.when')]"
        :hint="$t(`event.description`)"
        ref='date'
        prepend-icon='mdi-calendar'
        persistent-hint
        readonly
        v-on="inputEvents")

  v-date-picker.col-md-4(
    mode='dateTime'
    :minute-increment="5"
    :input-debounce="200"
    :min='today'
    is-dark
    is-expanded
    @input='v => change("due", v)'
    :value="value.due"
    :locale='$i18n.locale')
    template(v-slot="{ inputValue, inputEvents }")
      v-text-field(
        :value='inputValue'
        :label="$t('event.from')"
        :hint="$t(`event.description`)"
        ref='date'
        prepend-icon='mdi-calendar'
        persistent-hint
        readonly
        v-on="inputEvents")

    //- v-btn-toggle(v-if="type === 'recurrent'" v-model='value.recurrent.frequency' color='primary')
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

    //- v-btn-toggle.col-md-4(@change='changeType' color='primary' :value='value.type')
    //-   v-btn(value='normal') {{$t('event.normal')}}
    //-   v-btn(value='multidate') {{$t('event.multidate')}}
  v-switch.col-md-2(v-model='is_recurrent' :label="$t('event.recurrent')" inset)
  v-menu(v-if='settings.allow_recurrent_event && is_recurrent' offset-y open-on-hover)
    template(v-slot:activator="{ on, attrs }")
      v-btn.col-md-2.mt-2(color='primary' value='recurrent' v-on='on') {{$t('event.recurrent')}}
    v-list
      v-list-item-group(color='primary' v-model='frequency')
        v-list-item(v-for='f in frequencies' :key='f.value'
          @click='selectFrequency(f.value)') {{f.text}}

    //- div.text-center.mb-2(v-if='value.type === "recurrent"')
    //-   span(v-if='value.recurrent.frequency !== "1m" && value.recurrent.frequency !== "2m"') {{whenPatterns}}
    //-   v-btn-toggle.mt-1(v-else v-model='value.recurrent.type' color='primary')
    //-     v-btn(v-for='whenPattern in whenPatterns' :value='whenPattern.key' :key='whenPatterns.key' small)
    //-       span {{whenPattern.label}}

    //- List(v-if='type==="normal" && todayEvents.length' :events='todayEvents' :title='$t("event.same_day")')

</template>
<script>
import dayjs from 'dayjs'
import { mapState } from 'vuex'
import List from '@/components/List'

export default {
  name: 'WhenInput',
  components: { List },
  props: {
    value: { type: Object, default: () => ({ from: null, due: null, recurrent: null }) }
  },
  data () {
    return {
      is_recurrent: false,
      today: dayjs().format('YYYY-MM-DD'),
      frequency: '',
      frequencies: [
        { value: '1w', text: this.$t('event.each_week') },
        { value: '2w', text: this.$t('event.each_2w') },
        { value: '1m', text: this.$t('event.each_month') }
      ]
    }
  },
  computed: {
    ...mapState(['settings', 'events']),
    whenPatterns () {
      if (!this.value.date) { return }
      const date = dayjs(this.value.date)

      const freq = this.value.recurrent.frequency
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
  },
  methods: {
    change (what, date) {
      const v = this.value
      v[what] = date
      this.$emit('input', v)
    },
    changeType (type) {
      this.$emit('input', { date: null, recurrent: {} })
      if (type !== 'recurrent') {
        this.frequency = ''
      }
    },
    selectFrequency (f) {
      this.$emit('input', { recurrent: { frequency: f }, date: null })
    }
    // pick (date) {
    //   if (this.value.type === 'normal' || this.value.type === 'recurrent' || (this.value.date && this.value.date.length === 2)) {
    //     this.datePickerMenu = false
    //   }
    //   this.$emit('input', { date, recurrent: this.value.recurrent })
    // }
  }
}
</script>
