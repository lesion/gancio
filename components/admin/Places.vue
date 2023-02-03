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
      v-card-text
        v-form(v-model='valid' ref='form' lazy-validation)
          v-text-field(
            :rules="[$validators.required('common.name')]"
            :label="$t('common.name')"
            v-model='place.name'
            :placeholder='$t("common.name")')

          v-combobox(ref='address'
            :prepend-icon='mdiMapSearch'
            @input.native='searchAddress'
            :label="$t('common.address')"
            :rules="[ v => $validators.required('common.address')(v)]"
            :value='place.address'
            persistent-hint hide-no-data clearable no-filter
            :loading='loading'
            @change='selectAddress'
            @focus='searchAddress'
            :items="addressList"
            :hint="$t('event.address_description')")
            template(v-slot:item="{ item, attrs, on  }")
              v-list-item(v-bind='attrs' v-on='on')
                v-list-item-content(two-line v-if='item')
                  v-list-item-title(v-text='item.name')
                  v-list-item-subtitle(v-text='`${item.address}`')


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
import { mdiPencil, mdiChevronLeft, mdiChevronRight, mdiMagnify, mdiEye, mdiMapSearch, mdiChevronDown } from '@mdi/js'
import { mapState } from 'vuex'
import debounce from 'lodash/debounce'
import get from 'lodash/get'

export default {
  data( {$store} ) {
    return {
      mdiPencil, mdiChevronRight, mdiChevronLeft, mdiMagnify, mdiEye, mdiMapSearch, mdiChevronDown,
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
      geocoding_provider_type: $store.state.settings.geocoding_provider_type || 'Nominatim'
    }
  },
  async fetch() {
    this.places = await this.$axios.$get('/places')
  },
  computed: {
    ...mapState(['settings']),
  },
  methods: {
    editPlace(item) {
      this.place.name = item.name
      this.place.address = item.address
      if (this.settings.allow_geolocation) {
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
        // }
      } else {
        this.place.address = v
        this.place.latitude = this.place.longitude = null
      }
      this.$emit('input', { ...this.place })
    },
    searchAddress: debounce(async function(ev) {
      const pre_searchCoordinates = ev.target.value.trim().toLowerCase()
      // allow pasting coordinates lat/lon and lat,lon
      const searchCoordinates = pre_searchCoordinates.replace('/', ',')
      // const regex_coords_comma = "-?[1-9][0-9]*(\\.[0-9]+)?,\\s*-?[1-9][0-9]*(\\.[0-9]+)?";
      // const regex_coords_slash = "-?[1-9][0-9]*(\\.[0-9]+)?/\\s*-?[1-9][0-9]*(\\.[0-9]+)?";

      // const setCoords = (v) => {
      //   const lat = v[0].trim()
      //   const lon = v[1].trim()
      //   // check coordinates are valid
      //   if ((lat < 90 && lat > -90)
      //   && (lon < 180 && lon > -180)) {
      //     this.place.latitude = lat
      //     this.place.longitude = lon
      //   } else {
      //     this.$root.$message("Non existent coordinates", { color: 'error' })
      //     return
      //   }
      // }

      // if (pre_searchCoordinates.match(regex_coords_comma)) {
      //   let v = pre_searchCoordinates.split(",")
      //   setCoords(v)
      //   return
      // }
      // if (pre_searchCoordinates.match(regex_coords_slash)) {
      //   let v = pre_searchCoordinates.split("/")
      //   setCoords(v)
      //   return
      // }

      if (searchCoordinates.length) {
        this.loading = true
        const ret = await this.$axios.$get(`placeOSM/${this.geocoding_provider_type}/${searchCoordinates}`)
        if (this.geocoding_provider_type == "Nominatim") {
          if (ret && ret.length) {
            this.addressList = ret.map(v => {
              const name = get(v.namedetails, 'alt_name', get(v.namedetails, 'name'))
              const address = v.display_name ? v.display_name.replace(name, '').replace(/^, ?/, '') : ''
              return {
                class: v.class,
                type: v.osm_type,
                lat: v.lat,
                lon: v.lon,
                name,
                address
              }
            })
          } else {
            this.addressList = []
          }
        } else if (this.geocoding_provider_type == "Photon") {
          let photon_properties = ['housenumber', 'street', 'district', 'city', 'county', 'state', 'postcode', 'country']

          if (ret) {
            this.addressList = ret.features.map(v => {
              let pre_name = v.properties.name || v.properties.street || ''
              let pre_address = ''

              photon_properties.forEach((item, i) => {
                let last = i == (photon_properties.length - 1)
                if (v.properties[item] && !last) {
                  pre_address += v.properties[item]+', '
                } else if (v.properties[item]) {
                  pre_address += v.properties[item]
                }
              });

              let name = pre_name
              let address = pre_address
              return {
                class: v.properties.osm_key,
                type: v.properties.osm_type,
                lat: v.geometry.coordinates[1],
                lon: v.geometry.coordinates[0],
                name,
                address
              }
            })
          } else {
            this.addressList = []
          }
        }
        this.loading = false
      }
    }, 300)
  }
}
</script>
