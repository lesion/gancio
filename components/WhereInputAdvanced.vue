<template lang="pug">
v-card
  v-card-title {{ $t('event.where_advanced_options') }}
  v-card-subtitle {{ $t('event.where_advanced_options_description') }}

  v-card-text(v-if='settings.allow_event_also_online')
    v-switch.mt-0.mb-4(v-model='online_event_only_update' 
      v-if='settings.allow_event_only_online'
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
    v-combobox(ref='geocodedAddress' v-if="settings.allow_geolocation && place.name !== 'online' || (!settings.allow_event_only_online && place.name === 'online')"
      :prepend-icon='mdiMapSearch'
      @input.native='searchAddress'
      :label="$t('common.address')"
      :value='place.geocodedAddress'
      item-text='address'
      persistent-hint hide-no-data clearable no-filter
      :loading='loading'
      @change='selectAddress'
      @focus='searchAddress'
      :items="addressList"
      :hint="$t('event.address_description_osm')")
      template(v-slot:message="{message, key}")
        span(v-html='message' :key="key")
      template(v-slot:item="{ item, attrs, on  }")
        v-list-item(v-bind='attrs' v-on='on')
          v-icon.pr-4(v-text='loadCoordinatesResultIcon(item)')
          v-list-item-content(two-line v-if='item')
            v-list-item-title(v-text='item.name')
            v-list-item-subtitle(v-text='`${item.address}`')

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

    MapEdit.mt-4(:place='place' :key='mapEdit' v-if="(settings.allow_geolocation && place.name !== 'online' && place.latitude && place.longitude)"  )

  v-card-actions
    v-spacer
    v-btn(@click='close' outlined) Close

</template>
<script>
import { mdiMap, mdiLatitude, mdiLongitude, mdiCog, mdiLink, mdiCloseCircle, mdiMapMarker, mdiMapSearch, mdiRoadVariant, mdiHome, mdiCityVariant } from '@mdi/js'
import { mapState } from 'vuex'
import debounce from 'lodash/debounce'
import get from 'lodash/get'
import nominatim from '../server/services/geocoding/nominatim'
import photon from '../server/services/geocoding/photon'

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
      mdiMapMarker, mdiMapSearch, mdiRoadVariant, mdiHome, mdiCityVariant,
      showOnline: $store.state.settings.allow_event_also_online,
      showGeocoded: $store.state.settings.allow_geolocation && this.place.isNew,
      online_event_only: this.place.name === 'online',
      mapEdit: 1,
      addressList: [],
      loading: false,
      nominatim_osm_type: {
        way: mdiRoadVariant,
        house: mdiHome,
        node: mdiMapMarker,
        relation: mdiCityVariant,
      },
      nominatim_class: ['amenity', 'shop', 'tourism', 'leisure', 'building'],
      photon_osm_key: ['amenity', 'shop', 'tourism', 'leisure', 'building'],
      photon_osm_type: {
        'W': mdiRoadVariant,
        'N': mdiMapMarker,
        'R': mdiCityVariant,
      },
      geocoding_provider_type: $store.state.settings.geocoding_provider_type || 'Nominatim',
      nominatimProvider: nominatim,
      photonProvider: photon,
      prevAddress: ''
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
    },
    loadCoordinatesResultIcon(item) {
      if (this.geocoding_provider_type == "Nominatim") {
        if ( this.nominatim_class.includes(item.class)) {
          return this.mdiHome
        }
        return this.nominatim_osm_type[item.type]
      } else if (this.geocoding_provider_type == "Photon") {
        if ( this.photon_osm_key.includes(item.class)) {
          return this.mdiHome
        }
        return this.photon_osm_type[item.type]
      }
    },
    searchAddress: debounce(async function(ev) {
      const pre_searchCoordinates = ev.target.value.trim().toLowerCase()
      const searchCoordinates = pre_searchCoordinates.replace('/', ',')
      if (searchCoordinates.length) {
        this.loading = true
        const ret = await this.$axios.$get(`placeOSM/${this.geocoding_provider_type}/${searchCoordinates}`)

        // this.geocoding_provider.mapQueryResults(ret)

        if (this.geocoding_provider_type == "Nominatim") {
          this.addressList = nominatim.mapQueryResults(ret)
        } else if (this.geocoding_provider_type == "Photon") {
          this.addressList = photon.mapQueryResults(ret)
        }
        this.loading = false
      }
    }, 1000),
    selectAddress (v) {
      if (!v) { return }
      if (typeof v === 'object') {
          this.place.latitude = v.lat
          this.place.longitude = v.lon
          if (this.place.address === '' || this.place.address === this.prevAddress ) {
            this.place.address = v.address
          }
      } else {
        this.place.latitude = this.place.longitude = null
      }
      this.mapEdit++
      this.prevAddress = v.address
    },
  }
}
</script>
