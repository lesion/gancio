<template lang="pug">
  v-container#home(fluid)

    //- Announcements
    Announcement(v-for='announcement in announcements' :key='`a_${announcement.id}`' :announcement='announcement')

    v-row#calbarmb-2
      .col-xl-5.col-lg-5.col-md-6.col-sm-12.col-xs-12
        v-date-picker(
          @update:picker-date='monthChange'
          @click:date='dayChange'
          :locale='settings.locale'
          :events='calendarEvents'
          :value='date'
          landscape)

      .col
        Search(
          :filters='filters'
          @update='updateFilters')
        v-chip(v-if='selectedDay' close @click:close='dayChange(selectedDay)') {{selectedDay}}

    #events
      Event(v-for='event in events'
        :key='event.id' :event='event'
          @tagclick='tagClick' @placeclick='placeClick')

</template>

<script>
import { mapState, mapActions } from 'vuex'
import dayjs from 'dayjs'
import Event from '@/components/Event'
import Announcement from '@/components/Announcement'
import Search from '@/components/Search'

export default {
  name: 'Index',
  components: { Event, Search, Announcement },
  async asyncData ({ params, $api }) {
    const events = await $api.getEvents({
      start: dayjs().unix()
    })
    return { events }
  },
  data () {
    return {
      date: dayjs().format('YYYY-MM-DD'),
      events: [],
      start: dayjs().unix(),
      end: null,
      filters: { tags: [], places: [] },
      selectedDay: null
    }
  },
  computed: {
    ...mapState(['settings', 'announcements']),
    calendarEvents () {
      return this.events.map(e => dayjs.unix(e.start_datetime).format('YYYY-MM-DD'))
    }
  },
  methods: {
    ...mapActions(['setFilters']),
    async updateEvents () {
      this.events = await this.$api.getEvents({
        start: this.start,
        end: this.end,
        places: this.filters.places,
        tags: this.filters.tags
      })
      this.setFilters(this.filters)
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
    monthChange (monthYear) {
      this.selectedDay = null
      const [year, month] = monthYear.split('-')

      // check if current month is selected
      if (month - 1 === dayjs().month()) {
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
      if (this.selectedDay === day) {
        this.selectedDay = null
        this.date = dayjs().format('YYYY-MM-DD')
        this.start = dayjs().unix() // .startOf('week').unix()
        this.end = null
        this.updateEvents()
        return
      }
      this.start = dayjs(day).unix()
      this.end = dayjs(day).endOf('day').unix()
      this.date = dayjs(day).format('YYYY-MM-DD')
      this.selectedDay = day
      this.updateEvents()
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
