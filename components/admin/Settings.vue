<template lang="pug">
v-container
  v-card-title {{$t('common.settings')}}
  v-card-text

    v-text-field(v-model='title'
      :label="$t('common.title')"
      :hint="$t('admin.title_description')"
      @blur='save("title", title)'
      persistent-hint)

    v-text-field.mt-5(v-model='description'
      :label="$t('common.description')"
      :hint="$t('admin.description_description')"
      persistent-hint
      @blur='save("description", description)')

    //- select timezone
    v-autocomplete.mt-5(v-model='instance_timezone'
      :label="$t('admin.select_instance_timezone')"
      :hint="$t('admin.instance_timezone_description')"
      :items="filteredTimezones"
      persistent-hint
      placeholder='Timezone, type to search')

    v-select.mt-5(
      v-model='instance_locale'
      :label="$t('admin.instance_locale')"
      :hint="$t('admin.instance_locale_description')"
      persistent-hint
      :items='locales'
    )

    v-switch.mt-4(v-model='allow_registration'
      inset
      :label="$t('admin.allow_registration_description')")

    v-switch.mt-1(v-model='allow_anon_event'
      inset
      :label="$t('admin.allow_anon_event')")

    v-switch.mt-1(v-model='allow_recurrent_event'
      inset
      :label="$t('admin.allow_recurrent_event')")

    v-switch.mt-1(v-if='allow_recurrent_event'
      v-model='recurrent_event_visible'
      inset
      :label="$t('admin.recurrent_event_visible')")

    v-switch.mt-1(v-model='allow_geolocalization'
      inset
      :label="$t('admin.allow_geolocalization')")

  v-dialog(v-model='showSMTP' destroy-on-close max-width='700px' :fullscreen='$vuetify.breakpoint.xsOnly')
    SMTP(@close='showSMTP = false')

  v-card-actions
    v-btn(text @click='showSMTP=true')
      <v-icon v-if='!settings.admin_email' color='error' v-text='mdiAlert'></v-icon> {{$t('admin.show_smtp_setup')}}
    v-btn(text @click='$emit("complete")' color='primary' v-if='setup') {{$t('common.next')}}
      v-icon(v-text='mdiArrowRight')

</template>
<script>
import SMTP from './SMTP.vue'
import { mapActions, mapState } from 'vuex'
import moment from 'dayjs'
import tzNames from './tz.json'
import locales from '../../locales/esm'
import { mdiAlert, mdiArrowRight } from '@mdi/js'

export default {
  props: {
    setup: { type: Boolean, default: false }
  },
  components: { SMTP },
  name: 'Settings',
  data ({ $store }) {
    return {
      mdiAlert, mdiArrowRight,
      title: $store.state.settings.title,
      description: $store.state.settings.description,
      locales: Object.keys(locales).map(locale => ({ value: locale, text: locales[locale] })),
      showSMTP: false,
    }
  },
  computed: {
    ...mapState(['settings']),
    instance_locale: {
      get () { return this.settings.instance_locale },
      set (value) { this.setSetting({ key: 'instance_locale', value }) }
    },
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
    allow_geolocalization: {
      get () { return this.settings.allow_geolocalization },
      set (value) { this.setSetting({ key: 'allow_geolocalization', value }) }
    },
    filteredTimezones () {
      const current_timezone = moment.tz.guess()
      tzNames.unshift(current_timezone)
      return tzNames
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
