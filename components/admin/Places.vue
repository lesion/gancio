<template lang='pug'>
v-container
  v-card-title {{ $t('common.places') }}
    v-spacer
    v-text-field(v-model='search'
      :append-icon='mdiMagnify' outlined rounded
      :label="$t('common.search')"
      single-line hide-details)
  v-card-subtitle(v-html="$t('admin.place_description')")

  v-dialog(v-model='dialog' width='600' :fullscreen='$vuetify.breakpoint.xsOnly')
    v-card
      v-card-title {{ $t('admin.edit_place') }}
      v-card-text.mb-4
        v-form(v-model='valid' ref='form' lazy-validation)
          v-text-field(
            :rules="[$validators.required('common.name')]"
            :label="$t('common.name')"
            v-model='place.name'
            :placeholder='$t("common.name")')
        
          v-text-field(ref='address'
            :rules="[ v => $validators.required('common.address')(v)]"
            :label="$t('common.address')"
            v-model='place.address'
            persistent-hint)
          
          v-combobox.mt-0.mb-4(ref='geocodedAddress' v-model='place.geocodedAddress'
            v-if="(settings.allow_geolocation && place.name !== 'online')"
            :disabled="!(settings.allow_geolocation && place.name !== 'online')"
            :prepend-icon='mdiMapSearch'
            @input.native='searchAddress'
            :label="$t('common.search_coordinates')"
            :value='place.latitude && place.longitude && place.geocodedAddress'
            persistent-hint hide-no-data clearable no-filter
            :loading='loading'
            @change='selectAddress'
            @focus='searchAddress'
            :items="addressList"
            :hint="$t('event.address_description_osm')")
            template(v-slot:message="{message, key}")
              span(v-html='message' :key="key")
            template(v-slot:item="{ item, attrs, on, selected  }")
              v-list-item(v-bind='attrs' v-on='on')
                v-icon.pr-4(v-text='loadCoordinatesResultIcon(item)')
                v-list-item-content(two-line v-if='item')
                  v-list-item-title(v-text='item.name')
                  v-list-item-subtitle(v-text='`${item.address}`') {{ selected }}

          v-row.mt-4(v-if="(settings.allow_geolocation && place.name !== 'online')")
            v-col.py-0(cols=12 md=6)
              v-text-field(v-model="place.latitude"
                :value="place.latitude"
                :prepend-icon='mdiLatitude'
                :disabled="(!settings.allow_geolocation || place.name === 'online')"
                :label="$t('common.latitude')"
                :rules="$validators.latitude")
            v-col.py-0(cols=12 md=6)
              v-text-field(v-model="place.longitude"
                :prepend-icon='mdiLongitude'
                :disabled="!settings.allow_geolocation || place.name === 'online'"
                :label="$t('common.longitude')"
                :rules="$validators.longitude")
          
          Map.mt-4(:place.sync='place' :key="dialog" draggable=true
            v-if="settings.allow_geolocation && place.name !== 'online' && place.latitude && place.longitude")     

      v-card-actions
        v-spacer
        v-btn(@click='dialog = false' outlined color='warning') {{ $t('common.cancel') }}
        v-btn(@click='savePlace' color='primary' outlined :loading='loading'
          :disable='!valid || loading') {{ $t('common.save') }}

  v-card-text
    v-data-table(
      :headers='headers'
      :items='places'
      :hide-default-footer='places.length < 5'
      :header-props='{ sortIcon: mdiChevronDown }'
      :footer-props='{ prevIcon: mdiChevronLeft, nextIcon: mdiChevronRight }'
      :search='search')
      template(v-slot:item.map='{ item }')
        v-icon(v-if='item.latitude && item.longitude' v-text='mdiMapMarker')
      template(v-slot:item.actions='{ item }')
        v-btn(@click='editPlace(item)' color='primary' icon)
          v-icon(v-text='mdiPencil')
        nuxt-link(:to='`/place/${item.name}`')
          v-icon(v-text='mdiEye')

</template>
<script>
import { mdiPencil, mdiChevronLeft, mdiChevronRight, mdiChevronDown, mdiMagnify, mdiEye, mdiMapMarker,
    mdiLatitude, mdiLongitude, mdiMapSearch, mdiRoadVariant, mdiHome, mdiCityVariant } from '@mdi/js'
import { mapState } from 'vuex'
import debounce from 'lodash/debounce'
import geolocation from '../../server/helpers/geolocation/index'

export default {
  components: {
    [process.client && 'Map']: () => import('@/components/Map.vue')
  },
  data( {$store} ) {
    return {
      mdiPencil, mdiChevronRight, mdiChevronLeft, mdiChevronDown, mdiMagnify, mdiEye, mdiMapMarker,
      mdiLatitude, mdiLongitude, mdiMapSearch, mdiRoadVariant, mdiHome, mdiCityVariant,
      loading: false,
      dialog: false,
      valid: false,
      places: [],
      addressList: [],
      address: '',
      search: '',
      place: { name: '', address: '', latitude: 0, longitude: 0, id: null },
      headers: [
        { value: 'name', text: this.$t('common.name') },
        { value: 'address', text: this.$t('common.address') },
        { value: 'map', text: 'Map' },
        { value: 'actions', text: this.$t('common.actions'), align: 'right' }
      ],
      currentGeocodingProvider: geolocation.getGeocodingProvider($store.state.settings.geocoding_provider_type),
      prevAddress: '',
      iconsMapper: {
        'mdiHome': mdiHome,
        'mdiRoadVariant': mdiRoadVariant,
        'mdiMapMarker': mdiMapMarker,
        'mdiCityVariant': mdiCityVariant
      }
    }
  },
  async fetch() {
    this.places = await this.$axios.$get('/places')
    // do not allow edit the online place
    this.places = this.places.filter(p => p.name !== 'online')
  },
  computed: {
    ...mapState(['settings']),
  },
  methods: {
    editPlace(item) {
      this.place.name = item.name
      this.place.address = item.address
      if (this.settings.allow_geolocation) {
        this.prevAddress = ''
        this.place.geocodedAddress = ''
        this.place.latitude = item.latitude
        this.place.longitude = item.longitude
      }
      this.place.id = item.id
      this.dialog = true
    },
    async savePlace() {
      if (!this.$refs.form.validate()) return
      this.loading = true
      await this.$axios.$put('/place', this.place)
      await this.$fetch()
      this.loading = false
      this.dialog = false
    },
    selectAddress (v) {
      let currentAddress = this.place.address
      this.place.geocodedAddress = ''
      this.dialog++

      if (!v) { return }
      if (typeof v === 'object') {
        this.place.latitude = v.lat
        this.place.longitude = v.lon
        this.place.geocodedAddress = v.address
        this.place.address = v.address
      } else {
        this.place.address = v
        this.place.latitude = this.place.longitude = null
      }
      if (currentAddress == '' || currentAddress == this.prevAddress) {
        this.place.address = this.place.geocodedAddress
      } else {
        this.place.address = currentAddress
      }
      this.place.selected = true
      this.prevAddress = this.place.geocodedAddress
      this.$emit('input', { ...this.place })
    },
    searchAddress: debounce(async function(ev) {
      const pre_searchCoordinates = ev.target.value.trim().toLowerCase()
      const searchCoordinates = pre_searchCoordinates.replace('/', ',')

      if (searchCoordinates.length) {
        this.loading = true
        const ret = await this.$axios.$get(`placeOSM/${this.currentGeocodingProvider.commonName}/${searchCoordinates}`)
        this.addressList = this.currentGeocodingProvider.mapQueryResults(ret)
        this.loading = false
      }
    }, 1000),
    loadCoordinatesResultIcon(item) {
      let icon = this.currentGeocodingProvider.loadResultIcon(item)
      return this.iconsMapper[icon]
    },
  }
}
</script>
