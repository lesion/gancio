<template lang="pug">
v-row.mb-4
  v-col(cols=12 md=6)
    v-combobox(ref='place'
      :rules="[$validators.required('common.where')]"
      :label="$t('common.where')"
      :hint="$t('event.where_description')"
      :prepend-icon='mdiMapMarker'
      no-filter
      hide-no-data
      @input.native='search'
      persistent-hint
      :value='value.name'
      item-text='name'
      :items="places"
      @change='selectPlace')
      template(v-slot:item="{ item, attrs, on }")
        v-list-item(v-bind='attrs' v-on='on')
          v-list-item-content(two-line v-if='item.create')
            v-list-item-title <v-icon color='primary' v-text='mdiPlus' :aria-label='$t("common.add")'></v-icon> {{$t('common.add')}} <strong>{{item.name}}</strong>
          v-list-item-content(two-line v-else)
            v-list-item-title(v-text='item.name')
            v-list-item-subtitle(v-text='item.address')


  v-col(cols=12 md=6)
    v-row.mx-0.my-0.align-center.justify-center
      v-combobox.mr-4(v-model="virtualLocations" v-if="settings.allow_event_only_online && value.name === 'online'"
        :prepend-icon='mdiLink'
        :hint="$t('event.online_locations_help')"
        :label="$t('event.online_event_urls')"
        clearable chips small-chips multiple deletable-chips hide-no-data hide-selected persistent-hint
        :delimiters="[',', ';', '; ']"
        :items="virtualLocations"
        @change='selectLocations')
        template(v-slot:selection="{ item, on, attrs, selected, parent }")
          v-chip(v-bind="attrs" close :close-icon='mdiCloseCircle' @click:close='parent.selectItem(item)'
            :input-value="selected" label small) {{ item }}
        template(v-slot:append)
          v-icon(v-text='mdiCog' :disabled='!value.name' @click="whereInputAdvancedDialog = true")
      
      v-text-field.mr-4(v-if="!settings.allow_geolocation && value.name !== 'online'"
        ref='address'
        :prepend-icon='mdiMap'
        :disabled='disableAddress'
        :rules="[ v => disableAddress ? true : $validators.required('common.address')(v)]"
        :label="$t('common.address')"
        :hint="$t('event.address_description')"
        persistent-hint
        @change="changeAddress"
        :value="value.address")
        template(v-slot:append v-if="settings.allow_event_also_online && place.name !== 'online'")
          v-icon(v-text='mdiCog' :disabled='!value.name' @click="whereInputAdvancedDialog = true")
      
      v-combobox(ref='address' v-if="settings.allow_geolocation && value.name !== 'online' || (!settings.allow_event_only_online && value.name === 'online')"
        :prepend-icon='mdiMapSearch'
        :disabled='disableAddress'
        @input.native='searchAddress'
        :label="$t('common.address')"
        :rules="[ v => disableAddress ? true : $validators.required('common.address')(v)]"
        :value='value.address'
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
        template(v-slot:append v-if="settings.allow_event_also_online || settings.allow_geolocation")
          v-icon(v-text='mdiCog' :disabled='!value.name || (!value.isNew && !settings.allow_event_also_online) ' @click="whereInputAdvancedDialog = true")

    v-dialog(v-model='whereInputAdvancedDialog' :key="whereAdvancedId" destroy-on-close max-width='700px' :fullscreen='$vuetify.breakpoint.xsOnly' dense)
      WhereInputAdvanced(ref='whereAdvanced' :place.sync='value' :event='event' @close='whereInputAdvancedDialog = false && this.$refs.address.blur()'
        :virtualLocations.sync="virtualLocations"
        :online_event_only_value.sync='online_event_only'
        @update:onlineEvent="changeOnlineEvent"
        @update:virtualLocations="selectLocations"
        )

    
</template>
<script>
import { mdiMap, mdiMapMarker, mdiPlus, mdiMapSearch, mdiRoadVariant, mdiHome, mdiCityVariant, mdiCog, mdiLink, mdiCloseCircle } from '@mdi/js'
import { mapState } from 'vuex'
import debounce from 'lodash/debounce'
import get from 'lodash/get'
import WhereInputAdvanced from './WhereInputAdvanced.vue'
import nominatim from '../server/services/geocoding/nominatim'
import photon from '../server/services/geocoding/photon'

export default {
  name: 'WhereInput',
  props: {
    value: { type: Object, default: () => ({}) },
    event: { type: Object, default: () => null },
  },
  components: { WhereInputAdvanced },
  data ( {$store} ) {
    return {
      mdiMap, mdiMapMarker, mdiPlus, mdiMapSearch, mdiRoadVariant, mdiHome, mdiCityVariant, mdiCog, mdiLink, mdiCloseCircle,
      places: [],
      place: { },
      placeName: '',
      disableAddress: true,
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
      whereInputAdvancedDialog: false,
      virtualLocations: this.event.locations || [],
      online_event_only: (this.value.name === 'online') ? true : false,
      whereAdvancedId: 1
    }
  },
  computed: {
    ...mapState(['settings']),
    filteredPlaces () {
      if (!this.placeName) { return this.places }
      const placeName = this.placeName.trim().toLowerCase()
      let nameMatch = false
      const matches = this.places.filter(p => {
        const tmpName = p.name.toLowerCase()
        const tmpAddress = p.address.toLowerCase()
        if (tmpName.includes(placeName)) {
          if (tmpName === placeName) { nameMatch = true }
          return true
        }
        return tmpAddress.includes(placeName)
      })
      if (!nameMatch) {
        matches.unshift({ create: true, name: this.placeName })
      }
      return matches
    }
  },
  mounted () {
    this.$nextTick( () => {
      this.search()
    })
  },
  methods: {
    search: debounce(async function(ev) {
      const search = ev ? ev.target.value.trim().toLowerCase() : ''
      this.places = await this.$axios.$get(`place?search=${search}`)

      // Filter out the place with name 'online' if not allowed
      if (this.places.length && !this.settings.allow_event_only_online) {
        this.places = this.places.filter(p => p.name !== 'online')
      }
      if (!search && this.places.length) { 
        return this.places 
      }
      const matches = this.places.filter(p => p.name !== 'online').find(p => search === p.name.toLocaleLowerCase())
      if (!matches && search) {
        this.places.unshift({ create: true, name: ev.target.value.trim() })
      }
    }, 200),
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
    selectPlace (p) {
      // force online events under place: online address: online
      this.online_event_only = false
      this.place.isNew = false
      this.whereAdvancedId++

      if (!p) { return }
      if (typeof p === 'object' && !p.create) {
        if (p.id === this.value.id) return
        this.place.name = p.name
        this.place.address = p.address
        if (this.settings.allow_geolocation) {
          this.place.latitude = p.latitude
          this.place.longitude = p.longitude
        }
        this.place.id = p.id
        if (this.settings.allow_event_only_online && this.place.name === 'online') {
          this.online_event_only = true
        }
        this.disableAddress = true
      } else { // this is a new place
        this.place.isNew = true
        this.whereAdvancedId++

        this.place.name = (p.name || p).trim()
        const tmpPlace = this.place.name.toLocaleLowerCase()
        // search for a place with the same name
        const place = this.places.find(p => !p.create && p.name.trim().toLocaleLowerCase() === tmpPlace)
        if (place) {
          this.place.name = place.name
          this.place.id = place.id
          this.place.address = place.address
          this.disableAddress = true
        } else {
          delete this.place.id
          this.place.address = ''
          if (this.settings.allow_geolocation) {
            this.place.details = p.details
            this.place.latitude = p.latitude
            this.place.longitude = p.longitude
          }
          // Prevent to provide link for 'event only online' if not allowed: reset locations
          if (!this.settings.allow_event_only_online && this.place.name === 'online') {
            this.event.locations = []
          }
          this.disableAddress = false
          this.$refs.place.blur()
          this.$refs.address.focus()
        }
      }
      this.$emit('input', { ...this.place })
    },
    changeAddress (v) {
      this.place.address = v
      this.$emit('input', { ...this.place })
      this.disableDetails = false
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
    selectLocations () {
      this.event.locations = []
      this.virtualLocations && this.virtualLocations.forEach((item, i) => {
        if (!item.startsWith('http')) {
          this.virtualLocations[i] = `https://${item}`
        }
        this.event.locations[i] = {'type': 'virtualLocation', 'url': this.virtualLocations[i] }
      })
    },
    changeOnlineEvent(v) {
      this.online_event_only = v
      // console.log(this.online_event_only)
      if (this.online_event_only) { this.place.name = this.place.address = 'online' }
      if (!this.online_event_only) { this.place.name = this.place.address = '' }
      this.place.latitude = null
      this.place.longitude = null

      // update virtualLocations
      this.event.locations && this.selectLocations()
      this.$emit('input', { ...this.place })
    },
  }
}
</script>
