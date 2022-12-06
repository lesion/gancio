<template lang="pug">
v-card
  v-card-title Geolocation and Map settings
  v-card-text
    p.mb-6(v-html="$t('admin.geolocation_description')")

    v-form
      v-autocomplete.mb-4(v-model='geocoding_provider_type'
        @blur="save('geocoding_provider_type', geocoding_provider_type )"
        :label="$t('admin.geocoding_provider_type')"
        :hint="$t('admin.geocoding_provider_type_help')"
        persistent-hint
        :items="geocoding_provider_type_items"
        :placeholder="geocoding_provider_type_default")

      v-text-field.mb-4(v-model='geocoding_provider'
        @blur="save('geocoding_provider', geocoding_provider )"
        :label="$t('admin.geocoding_provider')"
        :hint="$t('admin.geocoding_provider_help')"
        persistent-hint
        :placeholder="geocoding_provider_default")

      v-autocomplete.mb-6(v-model="geocoding_countrycodes" :disabled="!(geocoding_provider_type === null || geocoding_provider_type === 'Nominatim')"
        @blur="save('geocoding_countrycodes', geocoding_countrycodes )"
        :label="$t('admin.geocoding_countrycodes')"
        :items="countries"
        multiple chips small-chips persistent-hint
        item-value="code"
        item-text="name"
        :hint="$t('admin.geocoding_countrycodes_help')")

      v-text-field.mb-4(v-model='tilelayer_provider'
        @blur="save('tilelayer_provider', tilelayer_provider )"
        :label="$t('admin.tilelayer_provider')"
        :hint="$t('admin.tilelayer_provider_help')"
        persistent-hint
        :placeholder="tilelayer_provider_default")

      v-text-field(v-model='tilelayer_provider_attribution'
        @blur="save('tilelayer_provider_attribution', tilelayer_provider_attribution )"
        :label="$t('admin.tilelayer_provider_attribution')"
        :placeholder="tilelayer_provider_attribution_default")

      div(id="leaflet-map-preview" max-height='10px')

  v-card-actions
    v-spacer
    v-btn(color='primary' @click='testGeocodingProvider' :loading='testGeocodingLoading' outlined ) {{$t('admin.geocoding_test_button')}}
    v-btn(color='primary' @click='testTileLayerProvider' :loading='testTileLayerLoading' outlined ) {{$t('admin.tilelayer_test_button')}}
    v-btn(color='warning' @click="done" outlined) {{$t("common.ok")}}

</template>
<script>
import { mapActions, mapState } from 'vuex'
import { isoCountries } from '../../server/helpers/geolocation'
import "leaflet/dist/leaflet.css"

export default {
  props: {
    setup: { type: Boolean, default: false }
  },
  data ({ $store }) {
    return {
      loading: false,
      testGeocodingLoading: false,
      testTileLayerLoading: false,
      geocoding_provider_type_items: ['Nominatim', 'Photon'],
      geocoding_provider_type: $store.state.settings.geocoding_provider_type || '',
      geocoding_provider_type_default: 'Nominatim',
      geocoding_provider: $store.state.settings.geocoding_provider || '',
      geocoding_provider_default: "https://nominatim.openstreetmap.org/search" ,
      geocoding_countrycodes: $store.state.settings.geocoding_countrycodes || [],
      tilelayer_provider: $store.state.settings.tilelayer_provider || '',
      tilelayer_provider_default: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      tilelayer_provider_attribution: $store.state.settings.tilelayer_provider_attribution || '',
      tilelayer_provider_attribution_default: '<a target=\'_blank\' href=\"http://osm.org/copyright\">OpenStreetMap</a> contributors',
      countries: isoCountries,
      mapPreviewTest: null,
    }
  },
  created() {
    if (process.client) {
      const L = require('leaflet')
    }
  },
  computed: mapState(['settings', 'events']),
  methods: {
    ...mapActions(['setSetting']),
    async testGeocodingProvider () {
      this.testGeocodingLoading = true
      const geocodingProviderTest = this.geocoding_provider || this.geocoding_provider_default
      const geocodingSoftwareTest = this.geocoding_provider_type || this.geocoding_provider_type_default
      const geocodingQuery = 'building'

      try {
        if (geocodingSoftwareTest === 'Nominatim') {
          const geolocation = await this.$axios.$get(`${geocodingProviderTest}`, {timeout: 3000, params: {q: `${geocodingQuery}`, format: 'json', limit: 1 }} )
        } else if (geocodingSoftwareTest === 'Photon') {
          const geolocation = await this.$axios.$get(`${geocodingProviderTest}`, {timeout: 3000, params: {q: `${geocodingQuery}`, limit: 1}} )
        }

        this.$root.$message(this.$t('admin.geocoding_test_success', { service_name: geocodingProviderTest }), { color: 'success' })
      } catch (e) {
        this.$root.$message(this.$t('admin.tilelayer_test_error', { service_name: geocodingProviderTest }), { color: 'error' })
      }
      this.testGeocodingLoading = false
    },
    async testTileLayerProvider () {
      this.testTileLayerLoading = true
      const tileThis = this
      const tileLayerTest = this.tilelayer_provider || this.tilelayer_provider_default
      const tileLayerAttributionTest = this.tilelayer_provider_attribution || this.tilelayer_provider_attribution_default

      // init tilelayer
      if (this.mapPreviewTest == null) {
        this.mapPreviewTest = L.map("leaflet-map-preview").setView([40,40],10);
      }
      this.tileLayer = L.tileLayer(`${tileLayerTest}`, {attribution: `${tileLayerAttributionTest}`})
      this.tileLayer.addTo(this.mapPreviewTest)

      // tilelayer events inherited from gridlayer https://leafletjs.com/reference.html#gridlayer
      this.tileLayer.on('tileload', function (event) {
          tileThis.tileLayerTestSucess(event, tileLayerTest)
      });
      this.tileLayer.on('tileerror', function(error, tile) {
          tileThis.tileLayerTestError(event, tileLayerTest)
          tileThis.tileLayer = null
      });
      this.testTileLayerLoading = false
    },
    save (key, value) {
      if (this.settings[key] !== value) {
        this.setSetting({ key, value })
      }
    },
    done () {
      this.$emit('close')
    },
    geocodingTestError(event, tileLayerTest) {
      this.$root.$message(this.$t('admin.geocoding_test_error', { service_name: geocodingTest }), { color: 'error' })
    },
    tileLayerTestSucess(event, tileLayerTest) {
      this.$root.$message(this.$t('admin.tilelayer_test_success', { service_name: tileLayerTest }), { color: 'success' })
    },
    tileLayerTestError(event, tileLayerTest) {
      this.$root.$message(this.$t('admin.tilelayer_test_error', { service_name: tileLayerTest }), { color: 'error' })
    }

  }
}
</script>

<style>
#leaflet-map-preview {
  height: 6rem;
}
</style>
