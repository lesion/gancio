<template lang="pug">
client-only(placeholder='Loading...' )
  v-card
    v-card-text
      v-container
        LMap(ref="map"
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

        v-row.my-4.d-flex.flex-column.align-center.text-center
          .text-h6
            v-icon(v-text='mdiMapMarker' )
            nuxt-link.ml-2.text-decoration-none(v-text="event.place.name" :to='`/place/${event.place.name}`')
            .mx-2(v-text="`${event.place.address}`")
    v-card-actions
      v-row
        //- p.my-4(v-text="$t('common.getting_there')")
        v-btn.ml-2(icon large :href="routeBy('foot')")
          v-icon(v-text='mdiWalk')
        v-btn.ml-2(icon large :href="routeBy('bike')")
          v-icon(v-text='mdiBike')
        v-btn.ml-2(icon large :href="routeBy('car')")
          v-icon(v-text='mdiCar')
      v-spacer
      v-btn(@click='$emit("close")' outlined) Close
</template>
<script>

import "leaflet/dist/leaflet.css"
import { LMap, LTileLayer, LMarker, LPopup, LControlAttribution } from 'vue2-leaflet'
import { mapActions, mapState } from 'vuex'
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
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '<a target="_blank" href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      zoom: 14,
      center: [this.event.place.latitude, this.event.place.longitude],
      marker: {
        address: this.event.place.address,
        coordinates: {lat: this.event.place.latitude, lon: this.event.place.longitude}
      },
      routingProvider: 'openstreetmap',
    }
  },
  props: {
    event: { type: Object, default: () => ({}) }
  },
  mounted() {
    delete Icon.Default.prototype._getIconUrl;
    Icon.Default.mergeOptions({
      iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
      iconUrl: require('leaflet/dist/images/marker-icon.png'),
      shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
    });

    setTimeout(() => {
      this.$refs.map.mapObject.invalidateSize();
    }, 200);
  },
  computed: {
    ...mapState(['settings']),
  },
  methods: {
    ...mapActions(['setSetting']),
    // mountLocateControl() {
    //   this.$refs.map.mapObject.locate({
    //     locateOptions: {
    //       maxZoom: 10
    //     }
    //   });
    //   this.$refs.map.mapObject.MyLocate();
    // },
    routeBy () {
      const lat = this.event.place.latitude
      const lon = this.event.place.longitude
      const routingType = {
        foot: "engine=fossgis_osrm_foot",
        bike: "engine=fossgis_osrm_bike",
        transit: null,
        car: "engine=fossgis_osrm_car"
      }
      return `https://www.openstreetmap.org/directions?from=&to=${lat},${lon}&${routingType}#map=14/${lat}/${lon}`
     },
  }
}
</script>

<style>
  #leaflet-map {
    height: 55vh;
    width: 100%;
    border-radius: .3rem;
    border: 1px solid #fff;
    z-index: 1;
  }
</style>
