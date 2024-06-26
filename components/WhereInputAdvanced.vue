<template lang="pug">
v-card
  v-card-title {{ $t('event.where_advanced_options') }}
  v-card-subtitle {{ $t('event.where_advanced_options_description') }}

  v-card-text(v-if='showGeocoded')
    v-combobox(ref='geocodedAddress'
      :prepend-icon='mdiMapSearch'
      @input.native='searchAddress'
      :label="$t('common.search_coordinates')"
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
      v-col.py-0(cols=12 sm=6)
        v-text-field(v-model="place.latitude"
          :prepend-icon='mdiLatitude'
          :label="$t('common.latitude')"
          :rules="$validators.latitude")
      v-col.py-0(cols=12 sm=6)
        v-text-field(v-model="place.longitude"
          :prepend-icon='mdiLongitude'
          :label="$t('common.longitude')"
          :rules="$validators.longitude")
    p.mt-4(v-if='place.isNew' v-html="$t('event.address_geocoded_disclaimer')")

    Map.mt-4(:place='place' draggable=true
      v-if="(settings.allow_geolocation && place.latitude && place.longitude)"  )

  v-card-actions
    v-spacer
    v-btn(@click='close' outlined) Close

</template>
<script>
import { mdiMap, mdiLatitude, mdiLongitude, mdiCog, mdiLink, mdiCloseCircle, mdiMapMarker, 
  mdiMapSearch, mdiRoadVariant, mdiHome, mdiCityVariant } from '@mdi/js'
import { mapState } from 'vuex'
import debounce from 'lodash/debounce'
import geolocation from '../server/helpers/geolocation/index'

export default {
  name: 'WhereInputAdvanced',
  props: {
    place: { type: Object, default: () => ({}) },
    event: { type: Object, default: () => null },
  },
  components: {
    [process.client && 'Map']: () => import('@/components/Map.vue')
  },
  data ({$store}) {
    return {
      mdiMap, mdiLatitude, mdiLongitude, mdiCog, mdiLink, mdiCloseCircle,
      mdiMapMarker, mdiMapSearch, mdiRoadVariant, mdiHome, mdiCityVariant,
      addressList: [],
      loading: false,
      iconsMapper: {
        mdiHome,
        mdiRoadVariant,
        mdiMapMarker,
        mdiCityVariant
      },
      currentGeocodingProvider: geolocation.getGeocodingProvider($store.state.settings.geocoding_provider_type),
      prevAddress: ''
    }
  },
  computed: {
    ...mapState(['settings']),
    showGeocoded () {
      return this.settings.allow_geolocation && this.place.name !== 'online' && this.place.isNew
    },
  },
  methods: {
    close() {
      this.$emit('close')
    },
    loadCoordinatesResultIcon(item) {
      let icon = this.currentGeocodingProvider.loadResultIcon(item)
      return this.iconsMapper[icon]
    },
    searchAddress: debounce(async function(ev) {
      const pre_searchCoordinates = ev.target.value.trim().toLowerCase()
      const searchCoordinates = pre_searchCoordinates.replace('/', ',')
      if (searchCoordinates.length) {
        this.loading = true
        try {
          const ret = await this.$axios.$get(`placeOSM/${this.currentGeocodingProvider.commonName}/${searchCoordinates}`)
          this.addressList = this.currentGeocodingProvider.mapQueryResults(ret)
        } catch (e) {
          console.error(e)
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
      this.prevAddress = v.address
    },
  }
}
</script>
