<template>
  <v-container id='home' fluid>
    <div class="mt-3 mb-1 ml-1">
      <v-btn text color='primary' to='/'><v-icon v-text='mdiChevronLeft'/></v-btn>
    </div>

    <h1 class='d-block text-h4 font-weight-black text-center text-uppercase mt-5 mx-auto w-100 text-underline'><u>{{place.name}}</u></h1>
    <span class="d-block text-subtitle text-center w-100 mb-14">{{place.address}}</span>

    <!-- Events -->
    <div class="mb-2 mt-1 pl-1 pl-sm-2" id="events">
      <Event :event='event' v-for='(event, idx) in events' :lazy='idx>2' :key='event.id'></Event>
    </div>
  </v-container>
</template>
<script>

import { mdiChevronLeft } from '@mdi/js'
import Event from '@/components/Event'

export default {
  name: 'Tag',
  components: { Event },
  data () {
    return { mdiChevronLeft }
  },
  asyncData ({ $axios, params, error }) {
    try {
      const place = params.place
      return $axios.$get(`/place/${place}/events`)
    } catch (e) {
      error({ statusCode: 400, message: 'Error!' })
    }
  }

}
</script>