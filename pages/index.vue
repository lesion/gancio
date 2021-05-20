<template lang="pug">
  v-container#home(fluid)

    //- Announcements
    #announcements.mr-1
      Announcement(v-for='announcement in announcements' :key='`a_${announcement.id}`' :announcement='announcement')

    //- Calendar and search bar
    v-row.pt-0.pt-sm-2
      .col-xl-5.col-lg-5.col-md-7.col-sm-12.col-xs-12.pa-4.pa-sm-3
        //- this is needed as v-calendar does not support SSR
        //- https://github.com/nathanreyes/v-calendar/issues/336
        client-only
          Calendar(@dayclick='dayChange' @monthchange='monthChange' :events='filteredEvents')

      .col.pt-0.pt-md-2
        Search(:filters='filters' @update='updateFilters')
        v-chip(v-if='selectedDay' close @click:close='dayChange({ date: selectedDay})') {{selectedDay}}

    //- Events
    #events.mb-2.mt-1.pl-1.pl-md-0
      //- div.event(v-for='(event, idx) in events' :key='event.id' v-intersect="(entries, observer, isIntersecting) => intersecting[event.id] = isIntersecting")
      Event(:event='event' v-for='(event, idx) in visibleEvents' :key='event.id' @tagclick='tagClick' @placeclick='placeClick')

</template>

<script>
import { mapState, mapActions } from 'vuex'
import intersection from 'lodash/intersection'
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
      start: dayjs().startOf('month').unix(),
      end: null,
      show_recurrent: true
    })
    return { events }
  },
  data ({ $store }) {
    return {
      first: true,
      isCurrentMonth: true,
      now: dayjs().unix(),
      date: dayjs().format('YYYY-MM-DD'),
      events: [],
      start: dayjs().startOf('month').unix(),
      end: null,
      selectedDay: null
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

  computed: {
    ...mapState(['settings', 'announcements', 'filters']),
    filteredEvents () {
      let events = this.events
      if (!this.filters.places.length && !this.filters.tags.length) {
        if (this.filters.show_recurrent) {
          return this.events
        }
        events = events.filter(e => !e.parentId)
      }

      return events.filter(e => {
        // check tags intersection
        if (this.filters.tags.length) {
          const ret = intersection(this.filters.tags, e.tags)
          if (!ret.length) { return false }
        }
        // check if place is in filtered places
        if (this.filters.places.length && !this.filters.places.includes(e.place.id)) {
          return false
        }
        return true
      })
    },
    visibleEvents () {
      const now = dayjs().unix()
      if (this.selectedDay) {
        const min = dayjs(this.selectedDay).startOf('day').unix()
        const max = dayjs(this.selectedDay).endOf('day').unix()
        return this.filteredEvents.filter(e => (e.start_datetime < max && e.start_datetime > min))
      } else if (this.isCurrentMonth) {
        return this.filteredEvents.filter(e => e.end_datetime ? e.end_datetime > now : e.start_datetime + 2 * 60 * 60 > now)
      } else {
        return this.filteredEvents
      }
    }
  },
  methods: {
    // onIntersect (isIntersecting, eventId) {
    // this.intersecting[eventId] = isIntersecting
    // },
    ...mapActions(['setFilters']),
    updateEvents () {
      this.events = []
      return this.$api.getEvents({
        start: this.start,
        end: this.end,
        show_recurrent: true
      }).then(events => {
        this.events = events
        this.$nuxt.$loading.finish()
      })
    },
    placeClick (place_id) {
      if (this.filters.places.includes(place_id)) {
        this.setFilters({ ...this.filters, places: this.filters.places.filter(p_id => p_id !== place_id) })
      } else {
        this.setFilters({ ...this.filters, places: [].concat(this.filters.places, place_id) })
      }
    },
    tagClick (tag) {
      if (this.filters.tags.includes(tag)) {
        this.setFilters({ ...this.filters, tags: this.filters.tags.filter(t => t !== tag) })
      } else {
        this.setFilters({ ...this.filters, tags: [].concat(this.filters.tags, tag) })
      }
    },
    monthChange ({ year, month }) {
      // avoid first time monthChange event (onload)
      if (this.first) {
        this.first = false
        return
      }

      this.$nuxt.$loading.start()

      // unselect current selected day
      this.selectedDay = null

      // check if current month is selected
      if (month - 1 === dayjs().month() && year === dayjs().year()) {
        this.isCurrentMonth = true
        this.start = dayjs().startOf('month').unix()
        this.date = dayjs().format('YYYY-MM-DD')
      } else {
        this.isCurrentMonth = false
        this.date = ''
        this.start = dayjs().year(year).month(month - 1).startOf('month').unix() // .startOf('week').unix()
      }
      // TODO: check if calendar view is double
      this.end = dayjs().year(year).month(month).endOf('month').unix() // .endOf('week').unix()
      this.updateEvents()
    },
    updateFilters (filters) {
      this.setFilters(filters)
    },
    dayChange (day) {
      const date = dayjs(day.date).format('YYYY-MM-DD')
      if (this.selectedDay === date) {
        this.selectedDay = null
        return
      }
      this.selectedDay = date
    }
  }
}
</script>
