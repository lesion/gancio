<template lang="pug">
v-row(color='primary')
  //- p.my-4(v-text="$t('common.getting_there')")
  v-btn.mx-1(icon large :href="routeBy('foot')")
    v-icon(v-text='mdiWalk')
  v-btn.mx-1(icon large :href="routeBy('bike')")
    v-icon(v-text='mdiBike')
  v-btn.mx-1(icon large :href="routeBy('car')")
    v-icon(v-text='mdiCar')
</template>
<script>

import { mapActions } from 'vuex'
import { mdiWalk, mdiBike, mdiCar } from '@mdi/js'

export default {
  data () {
    return { mdiWalk, mdiBike, mdiCar }
  },
  props: {
    place: { type: Object, default: () => ({ latitude: 0, longitude: 0 }) }
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
      const lat = this.place.latitude
      const lon = this.place.longitude
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
