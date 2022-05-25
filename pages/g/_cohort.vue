<template>
  <v-container id='home' fluid>
    <div class="mt-3 mb-1 ml-1">
      <v-btn text color='primary' to='/'><v-icon v-text='mdiChevronLeft'/></v-btn>
      <v-btn v-for='cohort in cohorts' text color='primary' :key='cohort.id' :to='`/g/${cohort.name}`' v-text='cohort.name' />
    </div>

    <h1 class='d-block text-h3 font-weight-black text-center align-center text-uppercase mt-10 mb-12 mx-auto w-100 text-underline'><u>{{cohort}}</u></h1>

    <!-- Events -->
    <div class='mb-2 mt-1 pl-1 pl-sm-2' id="events">
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
  data ({ $route }) {
    return { mdiChevronLeft, cohort: $route.params.cohort, cohorts: [] }
  },
  async fetch () {
    this.cohorts = await this.$axios.$get('/cohorts')
  },
  async asyncData ({ $axios, params, error }) {
    try {
      const cohort = params.cohort
      const events = await $axios.$get(`/cohorts/${cohort}`)
      return { events }
    } catch (e) {
      console.error(e)
      error({ statusCode: 400, message: 'Error!' })
    }
  }

}
</script>