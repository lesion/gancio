<template lang="pug">
v-card
  v-container
    div(:style="{'height': mapHeight}")
      Map.mt-4(:place='event.place' :height='mapHeight' )
    
    v-row.my-4.d-flex.flex-column.align-center.text-center
      .text-h6
        v-icon(v-text='mdiMapMarker' )
        nuxt-link.ml-2.text-decoration-none(v-text="event.place.name" :to='`/place/${event.place.name}`')
        .mx-2(v-text="`${event.place.address}`")
  v-card-actions
    v-row(color='primary')
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

import { mapActions } from 'vuex'
import { mdiWalk, mdiBike, mdiCar, mdiMapMarker } from '@mdi/js'

export default {
  components: {
    [process.client && 'Map']: () => import('@/components/Map.vue')
  },
  data () {
    return {
      mdiWalk, mdiBike, mdiCar, mdiMapMarker,
      mapHeight: "55vh"
    }
  },
  props: {
    event: { type: Object, default: () => ({}) }
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
    routeBy (type) {
      const lat = this.event.place.latitude
      const lon = this.event.place.longitude
      const routingType = {
        foot: "engine=fossgis_osrm_foot",
        bike: "engine=fossgis_osrm_bike",
        transit: null,
        car: "engine=fossgis_osrm_car"
      }
      return `https://www.openstreetmap.org/directions?from=&to=${lat},${lon}&${routingType[type]}#map=14/${lat}/${lon}`
     },
  }
}
</script>
