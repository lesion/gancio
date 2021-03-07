<template lang="pug">
  v-container#home(fluid)

    //- Announcements
    #announcements.mr-1
      Announcement(v-for='announcement in announcements' :key='`a_${announcement.id}`' :announcement='announcement')

    //- Calendar and search bar
    v-row
      .col-xl-5.col-lg-5.col-md-7.col-sm-12.col-xs-12
        //- this is needed as v-calendar does not support SSR
        //- https://github.com/nathanreyes/v-calendar/issues/336
        client-only
          Calendar(@dayclick='dayChange' @monthchange='monthChange' :events='events')

      .col.pt-0.pt-md-2
        Search(:filters='filters' @update='updateFilters')
        v-chip(v-if='selectedDay' close @click:close='dayChange({ date: selectedDay})') {{selectedDay}}

    //- Events
    #events.mt-1
      //- div.event(v-for='(event, idx) in events' :key='event.id' v-intersect="(entries, observer, isIntersecting) => intersecting[event.id] = isIntersecting")
      Event(:event='event' v-for='(event, idx) in events' :key='event.id' @tagclick='tagClick' @placeclick='placeClick')

</template>

<script>
import { mapState, mapActions } from 'vuex'
import dayjs from 'dayjs'
import Event from '@/components/Event'
import Announcement from '@/components/Announcement'
import Search from '@/components/Search'
import Calendar from '@/components/Calendar'

export default {
  name: 'Index',
  components: { Event, Search, Announcement, Calendar },
  async asyncData ({ params, $api, store }) {
    const events = await $api.getEvents({
      start: dayjs().unix(),
      end: null,
      filters: { show_recurrent: store.state.settings.allow_recurrent_event && store.state.settings.recurrent_event_visible }
    })
    return { events, first: true }
  },
  data ({ $store }) {
    return {
      first: true,
      date: dayjs().format('YYYY-MM-DD'),
      events: [],
      start: dayjs().unix(),
      end: null,
      filters: { tags: [], places: [], show_recurrent: $store.state.settings.allow_recurrent_event && $store.state.settings.recurrent_event_visible },
      selectedDay: null
      // intersecting: {}
    }
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
  },
  computed: mapState(['settings', 'announcements']),
  methods: {
    // onIntersect (isIntersecting, eventId) {
    // this.intersecting[eventId] = isIntersecting
    // },
    ...mapActions(['setFilters']),
    updateEvents () {
      return this.$api.getEvents({
        start: this.start,
        end: this.end,
        places: this.filters.places,
        tags: this.filters.tags,
        show_recurrent: this.filters.show_recurrent
      }).then(events => {
        this.events = events
        this.setFilters(this.filters)
        this.$nuxt.$loading.finish()
      })
    },
    placeClick (place_id) {
      if (this.filters.places.includes(place_id)) {
        this.filters.places = this.filters.places.filter(p_id => p_id !== place_id)
      } else {
        this.filters.places.push(place_id)
      }
      this.updateEvents()
    },
    tagClick (tag) {
      if (this.filters.tags.includes(tag)) {
        this.filters.tags = this.filters.tags.filter(t => t !== tag)
      } else {
        this.filters.tags.push(tag)
      }
      this.updateEvents()
    },
    updateFilters (filters) {
      this.filters = filters
      this.updateEvents()
    },
    monthChange ({ year, month }) {
      if (this.first) {
        this.first = false
        return
      }
      this.$nuxt.$loading.start()
      this.selectedDay = null

      // check if current month is selected
      if (month - 1 === dayjs().month() && year === dayjs().year()) {
        this.start = dayjs().unix()
        this.date = dayjs().format('YYYY-MM-DD')
      } else {
        this.date = ''
        this.start = dayjs().year(year).month(month - 1).startOf('month').unix() // .startOf('week').unix()
      }
      // this.end = dayjs().year(year).month(month - 1).endOf('month').unix() // .endOf('week').unix()
      this.end = null
      this.updateEvents()
    },
    dayChange (day) {
      const date = dayjs(day.date).format('YYYY-MM-DD')
      if (this.selectedDay === date) {
        this.selectedDay = null
        this.start = dayjs().unix() // .startOf('week').unix()
        this.end = null
        this.updateEvents()
        return
      }
      this.start = dayjs(date).startOf('day').unix()
      this.end = dayjs(date).endOf('day').unix()
      this.selectedDay = date
      this.updateEvents()
    }
  }
}
</script>
<style lang='less'>
#home {
  max-width: 1400px;
  padding-right: 0px;
  overflow: hidden;
}

#events {
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

</style>
