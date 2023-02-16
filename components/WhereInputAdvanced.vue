<template lang="pug">
v-card
  v-card-title {{ $t('event.where_advanced_options') }}
  v-card-subtitle {{ $t('event.where_advanced_options_description') }}

  v-card-text(v-if="settings.allow_event_only_online")
    v-switch.mt-0.mb-2(v-model='online_event_only_update' 
      persistent-hint
      :label="$t('event.event_only_online_label')"
      :hint="$t('event.online_event_only_help')")

    v-combobox.mt-0.mb-0.mr-4.my-5(v-model="virtualLocations_update" 
      v-if="place.name !== 'online' && settings.allow_event_also_online"
      :prepend-icon='mdiLink'
      :hint="$t('event.additional_online_locations_help')"
      :label="$t('event.additional_online_locations')"
      clearable chips small-chips multiple deletable-chips hide-no-data hide-selected persistent-hint
      :delimiters="[',', ';', '; ']"
      :items="virtualLocations_update")
      template(v-slot:selection="{ item, on, attrs, selected, parent }")
        v-chip(v-bind="attrs" close :close-icon='mdiCloseCircle' @click:close='parent.selectItem(item)'
          :input-value="selected" label small) {{ item }}

  v-divider(v-if='showGeocoded && showOnline')

  v-card-text.mt-5(v-if='showGeocoded')
    v-text-field.mt-0.mb-0(v-model='place.address'
      :prepend-icon='mdiMap'
      :disabled="!settings.allow_geolocation || place.name === 'online'"
      persistent-hint
      :hint="$t('event.address_overwrite_help')"
      :label="$t('event.address_overwrite')")

    v-row.mt-4
      v-col.py-0(cols=12 md=6)
        v-text-field(v-model="place.latitude"
          :prepend-icon='mdiLatitude'
          :disabled="!settings.allow_geolocation || place.name === 'online'"
          :label="$t('common.latitude')"
          :rules="$validators.latitude")
      v-col.py-0(cols=12 md=6)
        v-text-field(v-model="place.longitude"
          :prepend-icon='mdiLongitude'
          :disabled="!settings.allow_geolocation || place.name === 'online'"
          :label="$t('common.longitude')"
          :rules="$validators.longitude")
    p.mt-4(v-html="$t('event.address_geocoded_disclaimer')")

    MapEdit.mt-4(:place='place' v-if="mapEdit && (settings.allow_geolocation && place.name !== 'online' && place.latitude && place.longitude)"  )

  v-card-actions
    v-spacer
    v-btn(@click='close' outlined) Close

</template>
<script>
import { mdiMap, mdiLatitude, mdiLongitude, mdiCog, mdiLink, mdiCloseCircle } from '@mdi/js'
import { mapState } from 'vuex'
import debounce from 'lodash/debounce'
import get from 'lodash/get'

export default {
  name: 'WhereInputAdvanced',
  props: {
    place: { type: Object, default: () => ({}) },
    event: { type: Object, default: () => null },
    online_event_only_value: { type: Boolean, default: false },
    virtualLocations: { type: Array, default: [] }
  },
  components: {
    [process.client && 'MapEdit']: () => import('@/components/MapEdit.vue')
  },
  data ({$store}) {
    return {
      mdiMap, mdiLatitude, mdiLongitude, mdiCog, mdiLink, mdiCloseCircle,
      showOnline: $store.state.settings.allow_event_also_online,
      showGeocoded: $store.state.settings.allow_geolocation && this.place.isNew,
      online_event_only: this.place.name === 'online',
      mapEdit: true
    }
  },
  computed: {
    ...mapState(['settings']),
    online_event_only_update: {
      get () { return this.online_event_only_value },
      set (value) {
        this.$emit('update:onlineEvent', value)
        this.close()
      }
    },
    virtualLocations_update: {
      get () { return this.virtualLocations },
      set (value) {
        this.$emit('update:virtualLocations', value)
      }
    },
  },
  methods: {
    close() {
      this.$emit('close')
    }
  }
}
</script>
