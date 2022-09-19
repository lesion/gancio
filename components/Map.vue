<template lang="pug">
client-only(placeholder='Loading...' )
  v-container
    LMap(ref="map"
        id="leaflet-map"
        :zoom="zoom"
        :center="center")
      LTileLayer(
          :url="url"
          :attribution="attribution")
      LMarker(
        v-for="item in markers"
        @add="openPopup"
        :key="item.id"
        :lat-lng="item.coordinates")
        LPopup(:content="item.address")

    v-row.my-4.d-flex.flex-column.align-center
      .text-h6
        v-icon(v-text='mdiMapMarker' )
        nuxt-link.ml-2.p-name.text-decoration-none(v-text="event.place.name" :to='`/place/${event.place.name}`')
        v-text.mx-2(v-text="`${event.place.address}`")
      v-text.my-4(v-text="$t('common.getting_there')")
      v-row
        v-btn.ml-2(icon large :href="routeByWalk()")
          v-icon(v-text='mdiWalk' color='white')
        v-btn.ml-2(icon large :href="routeByBike()")
          v-icon(v-text='mdiBike' color='white')
        v-btn.ml-2(icon large :href="routeByCar()")
          v-icon(v-text='mdiCar' color='white')

</template>
<script>

import "leaflet/dist/leaflet.css";
import { LMap, LTileLayer, LMarker, LPopup } from 'vue2-leaflet';
import { mapActions, mapState } from 'vuex'
import { Icon } from 'leaflet';
import { mdiWalk, mdiBike, mdiCar, mdiMapMarker } from '@mdi/js'

export default {
   components: {
     LMap,
     LTileLayer,
     LMarker,
     LPopup
   },
   data ({ $store }) {
     return {
       mdiWalk, mdiBike, mdiCar, mdiMapMarker,
       // url: "https://a.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png",
       url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
       attribution:
         '&copy; <a target="_blank" href="http://osm.org/copyright">OpenStreetMap</a> contributors',
       zoom: 14,
       center: [this.event.place.latitude, this.event.place.longitude],
       markers: [
         {
           address: this.event.place.address,
           coordinates: {lat: this.event.place.latitude, lon: this.event.place.longitude}
         }
       ],
       osm_navigation: 'https://www.openstreetmap.org/directions?from=&to=',
       routingType: {
         foot: "engine=fossgis_osrm_foot",
         bike: "engine=fossgis_osrm_bike",
         car: "engine=fossgis_osrm_car"
       }
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
     openPopup(event) {
        this.$nextTick(() => {
          event.target.openPopup();
        });
      },
     route (routingTypes) {
       return this.osm_navigation+this.event.place.latitude+','+this.event.place.longitude+'&'+routingTypes
     },
     routeByWalk() {
       return this.route(this.routingType.foot)
     },
     routeByBike() {
       return this.route(this.routingType.bike)
     },
     routeByCar() {
       return this.route(this.routingType.car)
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
