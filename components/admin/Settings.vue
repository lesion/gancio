<template lang="pug">
  div
    el-form(inline label-width="400px")
      //- select timezone
      el-form-item(:label="$t('admin.select_instance_timezone')")
        el-select(v-model='instance_timezone' filterable)
          el-option(v-for='timezone in timezones' :key='timezone.value' :value='timezone.value')
            span.float-left {{timezone.value}} 
            small.float-right.text-danger {{timezone.offset}}

      //- allow open registration
      el-form-item(:label="$t('admin.allow_registration_description')")
        el-switch(name='reg' v-model='allow_registration')

      //- allow anon event
      el-form-item(:label="$t('admin.allow_anon_event')")
        el-switch(v-model='allow_anon_event')

      el-form-item(:label="$t('admin.allow_recurrent_event')")
        el-switch(v-model='allow_recurrent_event')

      el-form-item(v-show='allow_recurrent_event' :label="$t('admin.recurrent_event_visible')")
        el-switch(v-model='recurrent_event_visible')

</template>
<script>
import { mapActions, mapState } from 'vuex'
import moment from 'moment-timezone'
import timezones from './timezones'
export default {
  name: 'Settings',
  computed: {
    timezones () {
      const current_timezone = moment.tz.guess()
      return timezones
        .filter(tz => tz !== current_timezone)
        .concat([current_timezone])
        .map(tz => ({ value: tz, offset: moment().tz(tz).format('z Z') }))
    },
    ...mapState(['settings']),
    instance_timezone: {
      get () { return this.settings.instance_timezone },
      set (value) { this.setSetting({ key: 'instance_timezone', value }) }
    },
    allow_registration: {
      get () { return this.settings.allow_registration },
      set (value) { this.setSetting({ key: 'allow_registration', value }) }
    },
    allow_anon_event: {
      get () { return this.settings.allow_anon_event },
      set (value) { this.setSetting({ key: 'allow_anon_event', value }) }
    },
    allow_recurrent_event: {
      get () { return this.settings.allow_recurrent_event },
      set (value) { this.setSetting({ key: 'allow_recurrent_event', value }) }
    },
    recurrent_event_visible: {
      get () { return this.settings.recurrent_event_visible },
      set (value) { this.setSetting({ key: 'recurrent_event_visible', value }) }
    },
  },
  methods: mapActions(['setSetting'])
}
</script>