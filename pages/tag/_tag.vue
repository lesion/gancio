<template>
  <v-container id='home' fluid>
    <div class="mt-3 mb-1 ml-1">
      <v-btn text color='primary' to='/'><v-icon v-text='mdiChevronLeft'/></v-btn>
    </div>

    <h1 class='d-block text-h3 font-weight-black text-center align-center text-uppercase mt-5 mb-16 mx-auto w-100 text-underline'><u>{{tag}}</u></h1>

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
  async asyncData ({ $axios, params, error }) {
    try {
      const tag = params.tag
      const events = await $axios.$get(`/events?tags=${tag}`)
      return { events, tag }
    } catch (e) {
      error({ statusCode: 400, message: 'Error!' })
    }
  }

}
</script>