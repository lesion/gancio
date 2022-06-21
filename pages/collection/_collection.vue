<template>
  <v-container class='px-0' fluid>

    <h1 class='d-block text-h3 font-weight-black text-center align-center text-uppercase mt-10 mb-12 mx-auto w-100 text-underline'><u>{{collection}}</u></h1>

    <!-- Events -->
    <div class='mb-2 mt-1 pl-1 pl-sm-2' id="events">
      <Event :event='event' v-for='(event, idx) in events' :lazy='idx>2' :key='event.id'></Event>
    </div>
  </v-container>
</template>
<script>

import { mapState } from 'vuex'
import Event from '@/components/Event'

export default {
  name: 'Collection',
  components: { Event },
  head () {
    const title = `${this.settings.title} - ${this.collection}`
    return {
      title,
      link: [
        { rel: 'alternate', type: 'application/rss+xml', title, href: this.settings.baseurl + `/feed/rss/collection/${this.collection}` },
        { rel: 'alternate', type: 'text/calendar', title, href: this.settings.baseurl + `/feed/ics/collection/${this.collection}` }
      ]
    }
  },
  computed: mapState(['settings']),  
  async asyncData ({ $axios, params, error }) {
    try {
      const collection = params.collection
      const events = await $axios.$get(`/collections/${collection}`)
      return { events, collection }
    } catch (e) {
      console.error(e)
      error({ statusCode: 400, message: 'Error!' })
    }
  }

}
</script>