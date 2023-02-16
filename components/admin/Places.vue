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
        
          v-text-field(
            :rules="[ v => $validators.required('common.address')(v)]"
            :label="$t('common.address')"
            v-model='place.address'
            persistent-hint)
          
          v-combobox.mt-0.mb-4(ref='geocodedAddress'
            v-if="(settings.allow_geolocation && place.name !== 'online')"
            :disabled="!(settings.allow_geolocation && place.name !== 'online')"
            :prepend-icon='mdiMapSearch'
            @input.native='searchAddress'
            :label="$t('admin.search_address')"
            :value='place.latitude && place.longitude && place.geocodedAddress'
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
                v-list-item-content(two-line v-if='item')
                  v-list-item-title(v-text='item.name')
                  v-list-item-subtitle(v-text='`${item.address}`')

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
          
          MapEdit.mt-4(:place='place' :key="mapEdit" v-if="settings.allow_geolocation && place.name !== 'online' && place.latitude && place.longitude")     

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
        span {{item.latitude && item.longitude && 'YEP' }}
      template(v-slot:item.actions='{ item }')
        v-btn(@click='editPlace(item)' color='primary' icon)
          v-icon(v-text='mdiPencil')
        nuxt-link(:to='`/place/${item.name}`')
          v-icon(v-text='mdiEye')

</template>
<script>
import { mdiPencil, mdiChevronLeft, mdiChevronRight, mdiMagnify, mdiEye, mdiMapSearch, mdiChevronDown,
  mdiLatitude, mdiLongitude } from '@mdi/js'
import { mapState } from 'vuex'
import debounce from 'lodash/debounce'
import nominatim from '../../server/services/geocoding/nominatim'
import photon from '../../server/services/geocoding/photon'
// import geolocation from '../../server/helpers/geolocation/index'

export default {
  components: {
    [process.client && 'MapEdit']: () => import('@/components/MapEdit.vue')
  },
  data( {$store} ) {
    return {
      mdiPencil, mdiChevronRight, mdiChevronLeft, mdiMagnify, mdiEye, mdiMapSearch, mdiChevronDown,
      mdiLatitude, mdiLongitude,
      loading: false,
      dialog: false,
      valid: false,
      places: [],
      addressList: [],
      address: '',
      search: '',
      place: { name: '', address: '', id: null },
      headers: [
        { value: 'name', text: this.$t('common.name') },
        { value: 'address', text: this.$t('common.address') },
        { value: 'map', text: 'Map' },
        { value: 'actions', text: this.$t('common.actions'), align: 'right' }
      ],
      geocoding_provider_type: $store.state.settings.geocoding_provider_type || 'Nominatim',
      nominatimProvider: nominatim,
      photonProvider: photon
    }
  },
  async fetch() {
    this.places = await this.$axios.$get('/places')
  },
  mounted() {
    // this.currentGeocodingProvider = geolocation.getGeocodingProvider(this.settings.geocoding_provider_type)
  },
  computed: {
    ...mapState(['settings']),
  },
  methods: {
    editPlace(item) {
      this.place.name = item.name
      this.place.address = item.address
      if (this.settings.allow_geolocation) {
        this.place.geocodedAddress = ''
        this.mapEdit++
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
      if (!v) { return }
      if (typeof v === 'object') {
        this.place.latitude = v.lat
        this.place.longitude = v.lon
        this.place.address = v.address
        if (this.settings.allow_geolocation) { 
          this.place.geocodedAddress = v.address
        }
      } else {
        this.place.address = v
        this.place.latitude = this.place.longitude = null
      }
      this.$emit('input', { ...this.place })
    },
    searchAddress: debounce(async function(ev) {
      const pre_searchCoordinates = ev.target.value.trim().toLowerCase()
      const searchCoordinates = pre_searchCoordinates.replace('/', ',')

      if (searchCoordinates.length) {
        this.loading = true
        const ret = await this.$axios.$get(`placeOSM/${this.geocoding_provider_type}/${searchCoordinates}`)
        if (this.geocoding_provider_type == "Nominatim") {
          this.addressList = nominatim.mapQueryResults(ret)
        } else if (this.geocoding_provider_type == "Photon") {
          this.addressList = photon.mapQueryResults(ret)
        }
        this.loading = false
      }
    }, 1000)
  }
}
</script>
