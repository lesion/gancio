<template lang="pug">
  v-container#home(fluid)
    Announcement(v-for='announcement in announcements' :key='`a_${announcement.id}`' :announcement='announcement')
    #calbar.row.mb-2
      .col-xl-5.col-lg-5.col-sm-5.col-xs-12

        client-only
          Calendar
      .col
        Search(past-filter recurrent-filter)

    #events
      Event(v-for='event in events' :key='event.id' :event='event')

</template>

<script>
import { mapGetters, mapState } from 'vuex'
import Event from '@/components/Event'
import Announcement from '@/components/Announcement'
import Calendar from '@/components/Calendar'
import Search from '@/components/Search'

export default {
  name: 'Home',
  components: { Calendar, Event, Search, Announcement },
  computed: {
    events () {
      return this.in_past ? this.filteredEventsWithPast : this.filteredEvents
    },
    ...mapGetters(['filteredEvents', 'filteredEventsWithPast']),
    ...mapState(['settings', 'in_past', 'announcements'])
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
<style lang='less'>
#home {
  max-width: 1400px;
}

#events {
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}
</style>
