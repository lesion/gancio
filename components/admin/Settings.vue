<template lang="pug">
  v-container
    v-card-title {{$t('common.settings')}}
    v-card-text

      //- select timezone
      v-autocomplete(v-model='instance_timezone'
        :label="$t('admin.select_instance_timezone')"
        :hint="$t('admin.instance_timezone_description')"
        :items="filteredTimezones"
        persistent-hint
        item-text='value'
        item-value='value'
        placeholder='Timezone, type to search')
        template(v-slot:item='{ item }')
          v-list-item-content
            v-list-item-title {{item.value}}
            v-list-item-subtitle {{item.offset}}

      v-select.mt-5(
        v-model='instance_locale'
        :label="$t('admin.instance_locale')"
        :hint="$t('admin.instance_locale_description')"
        persistent-hint
        :items='locales'
      )

      v-text-field.mt-5(v-model='title'
        :label="$t('common.title')"
        :hint="$t('admin.title_description')"
        @blur='save("title", title)'
        persistent-hint
      )

      v-text-field.mt-5(v-model='description'
        :label="$t('common.description')"
        :hint="$t('admin.description_description')"
        persistent-hint
        @blur='save("description", description)')

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

</template>
<script>
import { mapActions, mapState } from 'vuex'
import moment from 'moment-timezone'
import _ from 'lodash'
import locales from '../../locales/esm'

export default {
  name: 'Settings',
  data ({ $store }) {
    return {
      title: $store.state.settings.title,
      description: $store.state.settings.description,
      locales: Object.keys(locales).map(locale => ({ value: locale, text: locales[locale] }))
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
    filteredTimezones () {
      const current_timezone = moment.tz.guess()
      const ret = _(moment.tz.names())
        .unshift(current_timezone)
        .map(tz => ({ value: tz, offset: moment().tz(tz).format('z Z') }))
        .value()
      return ret
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
