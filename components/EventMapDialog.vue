<template lang="pug">
v-card
  v-container
    div(:style="{'height': mapHeight}")
      Map(:place='place' :height='mapHeight' )
    
    v-row.my-4.d-flex.flex-column.align-center.text-center
      .text-h6
        v-icon(v-text='mdiMapMarker' )
        nuxt-link.ml-2.text-decoration-none(v-text="place.name" :to='`/place/${place.name}`')
        .mx-2(v-text="`${place.address}`")
  v-card-actions.py-4
    HowToArriveNav(:place='place')
    v-spacer
    v-btn(@click='$emit("close")' outlined) Close
</template>
<script>

import { mdiMapMarker } from '@mdi/js'
import HowToArriveNav from '@/components/HowToArriveNav.vue'

export default {
  components: {
    HowToArriveNav,
    [process.client && 'Map']: () => import('@/components/Map.vue')
  },
  data () {
    return { mdiMapMarker }
  },
  props: {
    place: { type: Object, default: () => ({ latitude: 0, longitude: 0 }) },
    mapHeight: { type: String, default: '55vh' },
  }
}
</script>
