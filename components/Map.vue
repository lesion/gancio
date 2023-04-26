<template lang="pug">
client-only(placeholder='Loading...' )
  LMap(ref="leafletMap"
      id="leaflet-map"
      :style="{ 'height': height }"
      :zoom="zoom"
      :options="{attributionControl: false}"
      :center="center")
    LControlAttribution(position='bottomright' prefix="")
    LTileLayer(
        @tileload="$emit('tileload')"
        @tileerror="$emit('tileerror')"
        :url="url"
        :attribution="attribution")
    LMarker(v-if="showMarker"
      :lat-lng="marker.coordinates")

</template>
<script>

import "leaflet/dist/leaflet.css"
import { LMap, LTileLayer, LMarker, LPopup, LControlAttribution } from 'vue2-leaflet'
import { Icon } from 'leaflet'

export default {
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LPopup,
    LControlAttribution
  },
  data ({ $store }) {
    return {
      url: $store.state.settings.tilelayer_provider || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: $store.state.settings.tilelayer_provider_attribution || "<a target=\"_blank\" href=\"http://osm.org/copyright\">OpenStreetMap</a> contributors",
    }
  },
  computed: {
    center () {
      if (this.mapCenter.length)
        return this.mapCenter
      else {
        return [this.place.latitude, this.place.longitude]
      }
    },
    marker () {
      return {
        address: this.place.address,
        coordinates: {lat: this.place.latitude, lon: this.place.longitude }
      }      
    }
  },
  props: {
    place: { type: Object, default: () => ({ latitude: 0, longitude: 0 }) },
    height: { type: String, default: '' },
    showMarker: { type: Boolean, default: true },
    mapCenter: { type: Array, default: () => ([]) },
    zoom: { type: Number, default: () => (16) },
  },
  mounted() {
    delete Icon.Default.prototype._getIconUrl;
    Icon.Default.mergeOptions({
      iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
      iconUrl: require('leaflet/dist/images/marker-icon.png'),
      shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
    });

    setTimeout(() => {
      if (this.$refs.leafletMap && this.$refs.leafletMap.mapObject ) {
        this.$refs.leafletMap.mapObject.invalidateSize();
      }
    }, 200);
  }
}
</script>

<style>
  #leaflet-map {
    height: 10rem;
    border-radius: .3rem;
    border: 1px solid #fff;
    z-index: 1;
  }
</style>
