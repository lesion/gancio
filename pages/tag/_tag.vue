<template>
  <v-container id='home' class='pa-0 pa-sm-2' fluid>
    <v-btn text color='primary' to='/'><v-icon v-text='mdiChevronLeft'/> Home</v-btn><h2 class='d-inline'>{{$t('event.tag_description')}} <u>{{tag}}</u></h2>

    <!-- Events -->
    <!-- .mb-2.mt-1.pl-1.pl-sm-2 -->
    <div id="events">
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
      const events = await $axios.$get(`/events?tags=${params.tag}`)
      return { events, tag }
    } catch (e) {
      error({ statusCode: 400, message: 'Error!' })
    }
  }

}
</script>