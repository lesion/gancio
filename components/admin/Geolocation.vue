<template lang="pug">
v-card
  v-card-title {{$t('admin.geolocation')}}
  v-card-text
    p.mb-6(v-html="$t('admin.geolocation_description')")

    v-form
      v-row
        v-col(cols=12 md=3)
          v-autocomplete.mb-4(v-model='geocoding_provider_type'
            @blur="save('geocoding_provider_type', geocoding_provider_type )"
            :label="$t('admin.geocoding_provider_type')"
            :hint="$t('admin.geocoding_provider_type_help')"
            persistent-hint
            :items="geocoding_provider_type_items"
            :placeholder="geocoding_provider_type_default")

        v-col(cols=12 md=5)
          v-text-field.mb-4(v-model='geocoding_provider'
            @blur="save('geocoding_provider', geocoding_provider )"
            :label="$t('admin.geocoding_provider')"
            :hint="$t('admin.geocoding_provider_help')"
            persistent-hint
            :placeholder="geocoding_provider_default")

        v-col(cols=12 md=4)
          v-autocomplete.mb-6(v-model="geocoding_countrycodes" :disabled="!(geocoding_provider_type === null || geocoding_provider_type === 'Nominatim')"
            :append-icon='mdiChevronDown'
            @blur="save('geocoding_countrycodes', geocoding_countrycodes )"
            :label="$t('admin.geocoding_countrycodes')"
            :items="countries"
            multiple chips small-chips persistent-hint
            item-value="code"
            item-text="name"
            :hint="$t('admin.geocoding_countrycodes_help')")
      
      v-row
        v-col(cols=12 md=6)
          v-text-field.mb-4(v-model='tilelayer_provider'
            @blur="save('tilelayer_provider', tilelayer_provider )"
            :label="$t('admin.tilelayer_provider')"
            :hint="$t('admin.tilelayer_provider_help')"
            persistent-hint
            :placeholder="tilelayer_provider_default")

        v-col(cols=12 md=6)
          v-text-field(v-model='tilelayer_provider_attribution'
            @blur="save('tilelayer_provider_attribution', tilelayer_provider_attribution )"
            :label="$t('admin.tilelayer_provider_attribution')"
            :placeholder="tilelayer_provider_attribution_default")

      Map(:key='mapKey' v-if='mapPreview'
        @tileerror='tilelayerTestError'
        @tileload='tilelayerTestSuccess'
        height="20rem" 
        showMarker=false 
        :mapCenter='mapCenter' 
        :zoom='10')

  v-card-actions
    v-spacer
    v-btn(color='primary' @click='testGeocodingProvider' :loading='isNewGeocodingTest' outlined ) {{$t('admin.geocoding_test_button')}}
    v-btn(color='primary' @click='testTileLayerProvider' :loading='isNewTilelayerTest' outlined ) {{$t('admin.tilelayer_test_button')}}

</template>
<script>
import { mapActions, mapState } from 'vuex'
import { isoCountries } from '../../server/helpers/geolocation/isoCountries'
import geolocation from '../../server/helpers/geolocation/index'
import { mdiChevronDown } from '@mdi/js'

export default {
  components: { 
    [process.client && 'Map']: () => import('@/components/Map.vue')
  },
  data ({ $store }) {
    return {
      mdiChevronDown,
      mapKey: 0,
      mapPreview: false,
      mapCenter: [42, 42],
      isNewTilelayerTest: false,
      isNewGeocodingTest: false,
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
    }
  },
  computed: {
    ...mapState(['settings', 'events']),
    tilelayerTest() {
      const v = this.tilelayer_provider !== '' ? this.tilelayer_provider : this.tilelayer_provider_default
      return v
    },
    geocodingTest() {
      const v = this.geocoding_provider !== '' ? this.geocoding_provider : this.geocoding_provider_default
      return v
    }
  },
  methods: {
    ...mapActions(['setSetting']),
    async testGeocodingProvider () {
      this.isNewGeocodingTest = true
      const currentGeocodingProvider = geolocation.getGeocodingProvider(this.settings.geocoding_provider_type)
      // random query
      const geocodingQuery = Math.random().toString(36).slice(2, 7);
      try {
        const ret = await this.$axios.$get(`placeOSM/${currentGeocodingProvider.commonName}/${geocodingQuery}`, { timeout: 3000 })
        const res = currentGeocodingProvider.mapQueryResults(ret)
        this.geocodingTestSuccess()
      } catch (e) {
        this.geocodingTestError()
      }
      this.isNewGeocodingTest = false
    },
    testTileLayerProvider () {
      this.isNewTilelayerTest = true
      this.mapPreview = true
      this.mapKey++
    },
    save (key, value) {
      if (this.settings[key] !== value) {
        this.setSetting({ key, value })
      }
    },
    done () {
      this.$emit('close')
    },
    handleMsg(t, s, c) {
      this.$root.$message(this.$t(t, { service_name: s }), { color: c })
    },
    geocodingTestError() {
      this.handleMsg('admin.geocoding_test_error', this.geocodingTest, 'error')
    },
    geocodingTestSuccess() {
      this.handleMsg('admin.geocoding_test_success', this.geocodingTest, 'success')
    },
    tilelayerTestError() {
      this.isNewTilelayerTest && this.handleMsg('admin.tilelayer_test_error', this.tilelayerTest, 'error')
      this.isNewTilelayerTest = false
    },
    tilelayerTestSuccess() {
      this.isNewTilelayerTest && this.handleMsg('admin.tilelayer_test_success', this.tilelayerTest, 'success')
      this.isNewTilelayerTest = false
    }

  }
}
</script>

