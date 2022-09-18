<template lang="pug">
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
      :key="item.id"
      :lat-lng="item.position"
      :visible="item.visible"
      :draggable="item.draggable")

  v-row.my-4.d-flex.justify-center
    v-btn.ml-2(icon large :href="routeByWalk()")
      v-icon(v-text='mdiWalk' color='white')
    v-btn.ml-2(icon large :href="routeByBike()")
      v-icon(v-text='mdiBike' color='white')
    v-btn.ml-2(icon large :href="routeByBus()")
      v-icon(v-text='mdiBus' color='white')
    v-btn.ml-2(icon large :href="routeByCar()")
      v-icon(v-text='mdiCar' color='white')



</template>
<script>

import "leaflet/dist/leaflet.css";
import { LMap, LTileLayer, LMarker, LPopup } from 'vue2-leaflet';
import dayjs from 'dayjs';
import { mapActions, mapState } from 'vuex'
import { Icon } from 'leaflet';
import { mdiWalk, mdiBike, mdiCar, mdiBus } from '@mdi/js'

export default {
   components: {
     LMap,
     LTileLayer,
     LMarker,
     LPopup
   },
   data ({ $store }) {
     return {
       mdiWalk, mdiBike, mdiCar, mdiBus,
       // url: "https://a.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png",
       url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
       attribution:
         '&copy; <a target="_blank" href="http://osm.org/copyright">OpenStreetMap</a> contributors',
       zoom: 10,
       center: [42, 12],
       markers: [],
       osm_navigation: 'https://www.openstreetmap.org/directions?from=&to=',
       routingType: [
         {foot: "engine=fossgis_osrm_foot"},
         {bike: "engine=fossgis_osrm_bike"},
         {transit: null},
         {car: "engine=fossgis_osrm_car"},
       ]
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

     routeByWalk() {
       console.log(this.$root.$event)
       // return this.osm_navigation+this.$root.event.place.details+'&'+this.routingType.bike
     },
     routeByBike() {
       console.log(this.event.place)
       // return this.osm_navigation+this.$root.event.place.details+'&'+this.routingType.bike
     },
     routeByBus() {
       console.log(this.$root)
       // return this.osm_navigation+this.$root.event.place.details+'&'+this.routingType.bike
     },
     routeByCar() {
       console.log(this.$root)
       // return this.osm_navigation+this.$root.event.place.details+'&'+this.routingType.bike
     },
     route() {

     }
     // loadMarker(d) {
     //   this.event = JSON.stringify(d);
     //
     //   let newMarker = [{
     //     id: d.id,
     //     title: d.title,
     //     event: JSON.stringify(d),
     //     description: d.description,
     //     place: d.place,
     //     tags: d.tags,
     //     multidate: d.multidate,
     //     start_datetime: d.start_datetime,
     //     end_datetime: d.end_datetime,
     //     position: { lat: d.place.details.geometry.coordinates[1], lng: d.place.details.geometry.coordinates[0] },
     //     draggable: false,
     //     visible: true
     //   }]
     //
     //   this.markers.push.apply(this.markers, newMarker)
     // },

   }
}
</script>

<style>
  #leaflet-map {
    height: 55vh;
    width: 100%;
    border-radius: .5rem;
    border: 1px solid #fff;
    z-index: 1;
  }
</style>
