<template>
  <v-container class='px-0' fluid>
    <h1 class='d-block text-h4 font-weight-black text-center text-uppercase mt-10 mx-auto w-100 text-underline'>
      <u>{{ place.name }}</u>
    </h1>
    <span class="d-block text-subtitle text-center w-100 mb-14">{{ place.address }}</span>

    <!-- Events -->
    <div class="mb-2 mt-1 pl-1 pl-sm-2" id="events">
      <Event :event='event' v-for='(event, idx) in events' :lazy='idx > 2' :key='event.id'></Event>
    </div>
  </v-container>
</template>
<script>

import { mapState } from 'vuex'
import Event from '@/components/Event'

export default {
  name: 'Place',
  components: { Event },
  head() {
    const title = `${this.settings.title} - ${this.place.name}`
    return {
      title,
      link: [
        { rel: 'alternate', type: 'application/rss+xml', title, href: this.settings.baseurl + `/feed/rss/place/${this.place.name}` },
        { rel: 'alternate', type: 'text/calendar', title, href: this.settings.baseurl + `/feed/ics/place/${this.place.name}` }
      ]
    }
  },
  computed: mapState(['settings']),
  asyncData({ $axios, params, error }) {
    try {
      const place = params.place
      return $axios.$get(`/place/${place}`)
    } catch (e) {
      error({ statusCode: 400, message: 'Error!' })
    }
  }

}
</script>
