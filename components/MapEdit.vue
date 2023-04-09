<template lang="pug">
client-only(placeholder='Loading...' )
  LMap(ref="mapEdit"
      id="leaflet-map"
      :zoom="zoom"
      :options="{attributionControl: false}"
      :center="center")
    LControlAttribution(position='bottomright' prefix="")
    LTileLayer(
        :url="url"
        :attribution="attribution")
    LMarker(
      :lat-lng="marker.coordinates")

</template>
<script>

import "leaflet/dist/leaflet.css"
import { LMap, LTileLayer, LMarker, LPopup, LControlAttribution } from 'vue2-leaflet'
import { Icon } from 'leaflet'
import { mdiWalk, mdiBike, mdiCar, mdiMapMarker } from '@mdi/js'

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
      mdiWalk, mdiBike, mdiCar, mdiMapMarker,
      url: $store.state.settings.tilelayer_provider || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: $store.state.settings.tilelayer_provider_attribution || "<a target=\"_blank\" href=\"http://osm.org/copyright\">OpenStreetMap</a> contributors",
      zoom: 16,
    }
  },
  computed: {
    center () {
      return [this.place.latitude, this.place.longitude]
    },
    marker () {
      return {
        address: this.place.address,
        coordinates: {lat: this.place.latitude, lon: this.place.longitude }
      }      
    }
  },
  props: {
    place: { type: Object, default: () => ({ latitude: 0, longitude: 0 }) }
  },
  mounted() {
    delete Icon.Default.prototype._getIconUrl;
    Icon.Default.mergeOptions({
      iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
      iconUrl: require('leaflet/dist/images/marker-icon.png'),
      shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
    });

    setTimeout(() => {
      if (this.$refs.mapEdit && this.$refs.mapEdit.mapObject ) {
        this.$refs.mapEdit.mapObject.invalidateSize();
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
