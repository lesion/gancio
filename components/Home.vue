<template lang="pug">
  section#home

    .row.m-0.mt-1
      .col-xl-7.col-lg-7.col-sm-6.col-xs-12.p-0
        client-only
          Calendar
      .col
        Search(past-filter recurrent-filter)

    .row.m-0
      .p-0.col-sm-6.col-lg-4.col-xl-4(v-for='event in events' :key='event.id')
        a.d-block.d-sm-none.sticky(:id='event.newDay' v-if='event.newDay')
          el-divider {{event.start_datetime|day}}
        Event(
          :id='event.start_datetime'
          :event='event'
        )

</template>

<script>
import { mapGetters, mapState } from 'vuex'
import Event from '@/components/Event'
import Calendar from '@/components/Calendar'
import Search from '@/components/Search'

export default {
  name: 'Home',
  components: { Calendar, Event, Search },
  computed: {
    events () {
      return this.in_past ? this.filteredEventsWithPast : this.filteredEvents
    },
    ...mapGetters(['filteredEvents', 'filteredEventsWithPast']),
    ...mapState(['settings', 'in_past'])
  },
  head () {
    return {
      title: this.settings.title,
      meta: [
        // hid is used as unique identifier. Do not use `vmid` for it as it will not work
        { hid: 'description', name: 'description', content: this.settings.description },
        { hid: 'og-description', name: 'og:description', content: this.settings.description },
        { hid: 'og-title', property: 'og:title', content: this.settings.title },
        { hid: 'og-url', property: 'og:url', content: this.settings.baseurl },
        { property: 'og:image', content: this.settings.baseurl + '/favicon.ico' }
      ],
      link: [
        { rel: 'alternate', type: 'application/rss+xml', title: this.settings.title, href: this.settings.baseurl + '/feed/rss' }
      ]
    }
  }
}
</script>
