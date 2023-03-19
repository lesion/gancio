<template lang="pug">
v-container#home(fluid)

  v-form.ma-5(to='/search' action='/search' method='GET')
    v-text-field(name='search' :label='$t("common.search")' :value='$route.query.search' hide-details outlined rounded :append-icon='mdiMagnify')

  //- Events
  #events.mb-2.mt-1.pl-1.pl-sm-2
    Event(:event='event' @destroy='destroy' v-for='(event, idx) in events' :lazy='idx>2' :key='event.id')
</template>

<script>
import { mapState } from 'vuex'
import Event from '@/components/Event'
import Announcement from '@/components/Announcement'
import Calendar from '@/components/Calendar'
import { mdiMagnify } from '@mdi/js'

export default {
  name: 'Index',
  components: { Event, Announcement, Calendar },
  data ({ $time }) {
    return {
      mdiMagnify,
      events: [],
      start: $time.startMonth(),
      end: null,
    }
  },
  async fetch () {
    const search = this.$route.query.search
    this.events = await this.$axios.$get(`/event/search?search=${search}`)
  },
  computed: mapState(['settings']),
  methods: {
    destroy (id) {
      this.events = this.events.filter(e => e.id !== id)
    }
  }
}
</script>