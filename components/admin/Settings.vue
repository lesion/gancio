<template lang="pug">
  div
    el-form(label-width="400px")
      //- select timezone
      client-only
        el-form-item(:label="$t('admin.select_instance_timezone')")
          el-select(v-model='instance_timezone' filterable)
            el-option(v-for='timezone in timezones' :key='timezone.value' :value='timezone.value')
              span.float-left {{timezone.value}}
              small.float-right.text-danger {{timezone.offset}}

      el-form-item(:label="$t('common.title')")
        el-input(v-model='title' @blur='save("title", title)')

      el-form-item(:label="$t('common.description')")
        el-input(v-model='description' @blur='save("description", description)')

      //- allow open registration
      el-form-item(:label="$t('admin.allow_registration_description')")
        el-switch(name='reg' v-model='allow_registration')

      el-form-item(:label="$t('admin.favicon')")
        el-upload(ref='upload' :action='`${settings.baseurl}/api/settings/favicon`'
            :limit='1'
            name='favicon'
            accept='image/*'
            :multiple='false')
          el-button(slot='trigger' size='small' type='primary') select file
          .el-upload__tip(slot='tip') jpg/png files with a size less than 500kb

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
  data ({ $store }) {
    return {
      title: $store.state.settings.title,
      description: $store.state.settings.description,
    }
  },
  computed: {
    ...mapState(['settings']),
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
    }
  },
  methods: {
    ...mapActions(['setSetting']),
    save (key, value) {
      if (this.settings[key] !== value) {
        this.setSetting({ key, value })
      }
    }
  }
}
</script>
