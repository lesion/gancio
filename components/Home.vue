<template lang="pug">
  section
    el-backtop(target='body')
    //- el-backtop(target='#home')
    client-only
      Calendar
    .row.m-0

      .p-0.col-sm-6.col-lg-4.col-xl-3(v-for='event in events')
        a(:id='event.newDay' v-if='event.newDay')
          .d-block.d-sm-none
            el-divider {{event.start_datetime|day}}
        //- p(style='color: white;') {{event}}
        Event(
          :id='event.start_datetime'
          :key='event.id'
          :event='event'
        )

</template>

<script>
import { mapGetters, mapState } from 'vuex'
import Event from '@/components/Event'
import Calendar from '@/components/Calendar'

export default {
  name: 'Home',
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
  },
  components: { Calendar, Event },
  computed: {
    events () {
      return this.in_past ? this.filteredEventsWithPast : this.filteredEvents
    },
    ...mapGetters(['filteredEvents', 'filteredEventsWithPast']),
    ...mapState(['settings', 'in_past'])
  }
}
</script>
<style lang="less">
section {
  width: 100%;
  max-width: 1500px;
  margin: 0 auto;
}
</style>
