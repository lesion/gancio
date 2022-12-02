<template lang="pug">
v-card
  v-card-title Geolocation settings
  v-card-text
    p.mb-8(v-html="$t('admin.geolocation_description')")
    v-form(v-model='isValid')

      v-text-field.mb-4(v-model='geocoding_provider'
        @blur="save('geocoding_provider', geocoding_provider )"
        :label="$t('admin.geocoding_provider')"
        :hint="$t('admin.geocoding_provider_help')"
        persistent-hint
        :placeholder="geocoding_provider_default")

      v-autocomplete.mb-4(v-model='geocoding_countrycodes'
        @blur="save('geocoding_countrycodes', geocoding_countrycodes )"
        :label="$t('admin.geocoding_countrycodes')"
        chips multiple persistent-hint
        :items='countries'
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
        placeholder="map data © OpenStreetMap contributors under ODbL")

      clientOnly
        div.h-8.w-8(id="leaflet-map")

  v-card-actions
    v-spacer
    v-btn(color='primary' @click='testGeocodingProvider' :loading='testGeocodingLoading' outlined) {{$t('admin.geocoding_test_button')}}
    v-btn(color='primary' @click='testTileLayerProvider' :loading='testTileLayerLoading' outlined :disabled="false" ) {{$t('admin.tilelayer_test_button')}}
    v-btn(color='warning' @click="done" outlined) {{$t("common.ok")}}

</template>
<script>
import { mapActions, mapState } from 'vuex'
import { isoCountries } from '../../server/helpers/geolocation'
import "leaflet/dist/leaflet.css"

export default {
  data ({ $store }) {
    return {
      isValid: false,
      loading: false,
      testGeocodingLoading: false,
      testTileLayerLoading: false,
      geocoding_provider: $store.state.settings.geocoding_provider || '',
      geocoding_provider_default: "https://nominatim.openstreetmap.org/" ,
      geocoding_countrycodes: $store.state.settings.geocoding_countrycodes || [],
      tilelayer_provider: $store.state.settings.tilelayer_provider || '',
      tilelayer_provider_attribution: $store.state.settings.tilelayer_provider_attribution || '',
      tilelayer_provider_default: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      countries: isoCountries,
      mapTest: {},
    }
  },
  created() {
    if (process.client) {
      const L = require('leaflet')
    }
  },
  computed: {
    ...mapState(['settings', 'events']),
  },
  methods: {
    ...mapActions(['setSetting']),
    async testGeocodingProvider () {
      this.testGeocodingLoading = true
      try {
        const geolocation = await this.$axios.$get(`${this.geocoding_provider}search`, {timeout: 3000, params: {format: 'json', q: 'building', limit: 1}})
        this.$root.$message(this.$t('admin.geocoding_test_success', { service_name: this.geocoding_provider }), { color: 'success' })
      } catch (e) {
        // console.error(e)
        this.$root.$message(e, { color: 'error' })
      }
      this.testGeocodingLoading = false
    },
    async testTileLayerProvider () {
      this.testTileLayerLoading = true
      try {
        // clean
        // if (this.mapTest !== null) {
        //   this.mapTest.off();
        //   this.mapTest.remove();
        // }
        // init tilelayer
        this.mapTest = L.map("leaflet-map").setView([40,40],10);
        this.tileLayer = L.tileLayer(`${this.tilelayer_provider}`, {attribution: `${this.tilelayer_provider_attribution}`})
        const tileLayer = await this.tileLayer.addTo(this.mapTest)


        this.tileLayer.on('loading', function (event) {
            console.log(event)
            // this.mapTest.fireEvent('dataloading', event);
        });

        // this.tileLayer.on('load', function (event) {
        //     // this.mapTest.fireEvent('dataload', event);
        // });

        // this.tileLayer.on('tileerror', function(error, tile) {
        //     console.log(error);
        //     console.log(tile);
        // });
        //
        // this.tileLayer.on('tileabort', this.tileLayer.remove())
        //
        this.mapTest.off()
        this.mapTest.remove()

        // mapTest.on('dataload', handler)


        // function handler(event) {
        //   if (mapTest && mapTest.remove) {
        //       mapTest.off();
        //       mapTest.remove();
        //   }
        // }

      } catch (e) {
        console.error(e)
        this.$root.$message(e.response && e.response.data, { color: 'error' })
      }
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
    handlerLoad(event) {
      // this.mapTest.fireEvent('dataload', (event) => {
        this.$root.$message(this.$t('admin.tilelayer_test_success', { service_name: this.tilelayer_provider }), { color: 'success' })
        if (this.mapTest !== null) {
          this.mapTest.off();
          this.mapTest.remove();
        }
    }

  }
}
</script>
