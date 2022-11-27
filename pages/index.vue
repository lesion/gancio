<template lang="pug">
v-container.px-2.px-sm-6.pt-0

  //- View
  #themeview.mt-sm-4.mt-2
    ThemeView

  //- Announcements
  #announcements.mt-2.mt-sm-4(v-if='announcements.length')
    Announcement(v-for='announcement in announcements' :key='`a_${announcement.id}`' :announcement='announcement')

  //- Events
  #events.mt-sm-4.mt-2(:key="reload_events")
    Event(:event='event' v-for='(event, idx) in visibleEvents' :lazy='idx>2' :key='event.id')
</template>

<script>
import { mapState, mapActions } from 'vuex'
import debounce from 'lodash/debounce'
import dayjs from 'dayjs'
import Event from '@/components/Event'
import Announcement from '@/components/Announcement'
import ThemeView from '@/components/ThemeView'
import { mdiMagnify, mdiCloseCircle } from '@mdi/js'

export default {
  name: 'Index',
  components: { Event, Announcement, ThemeView },
  middleware: 'setup',
  async fetch () {
    return this.getEvents()
  },
  activated() {
    if (this.$fetchState.timestamp <= Date.now() - 60000) {
      this.$fetch();
    }
  },
  data ({ $store }) {
    return {
      mdiMagnify, mdiCloseCircle,
      isCurrentMonth: true,
      now: dayjs().unix(),
      date: dayjs.tz().format('YYYY-MM-DD'),
      start: dayjs().startOf('month').unix(),
      end: null,
      searching: false,
      tmpEvents: [],
      selectedDay: null,
      show_recurrent: $store.state.settings.recurrent_event_visible,
      reload_events: 0
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
        { property: 'og:image', content: this.settings.baseurl + '/logo.png' }
      ],
      link: [
        { rel: 'apple-touch-icon', href: this.settings.baseurl + '/logo.png' },
        { rel: 'alternate', type: 'application/rss+xml', title: this.settings.title, href: this.settings.baseurl + '/feed/rss' },
        { rel: 'alternate', type: 'text/calendar', title: this.settings.title, href: this.settings.baseurl + '/feed/ics' }
      ]
    }
  },
  computed: {
    ...mapState(['settings', 'announcements', 'events']),
    visibleEvents () {
      if (this.searching) {
        return this.tmpEvents
      }
      const now = dayjs().unix()
      if (this.selectedDay) {
        const min = dayjs.tz(this.selectedDay).startOf('day').unix()
        const max = dayjs.tz(this.selectedDay).endOf('day').unix()
        return this.events.filter(e => (e.start_datetime <= max && (e.end_datetime || e.start_datetime) >= min) && (this.show_recurrent || !e.parentId))
      } else if (this.isCurrentMonth) {
          return this.events.filter(e => ((e.end_datetime ? e.end_datetime > now : e.start_datetime + 3 * 60 * 60 > now) && (this.show_recurrent || !e.parentId)))
      } else {
        return this.events.filter(e => this.show_recurrent || !e.parentId)
      }
    }
  },
  created () {
    this.$root.$on('dayclick', this.dayChange)
    this.$root.$on('monthchange', this.monthChange)
    this.$root.$on('search', debounce(this.search, 100))
    this.$root.$on('layout_loaded', () => {
        this.reload_events++
    })
  },
  destroyed () {
    this.$root.$off('dayclick')
    this.$root.$off('monthchange')
    this.$root.$off('search')
  },
  methods: {
    ...mapActions(['getEvents']),
    async search (query) {
      if (query) {
        this.tmpEvents = await this.$axios.$get(`/event/search?search=${query}`)
        this.searching = true
      } else {
        this.tmpEvents = null
        this.searching = false
      }
    },
    updateEvents () {
      return this.getEvents({
        start: this.start,
        end: this.end,
        show_recurrent: true
      })
    },
    async monthChange ({ year, month }) {

      this.$nuxt.$loading.start()
      this.$nextTick( async () => {

        // unselect current selected day
        this.selectedDay = null

        // check if current month is selected
        if (month - 1 === dayjs.tz().month() && year === dayjs.tz().year()) {
          this.isCurrentMonth = true
          this.start = dayjs().startOf('month').unix()
          this.date = dayjs.tz().format('YYYY-MM-DD')
        } else {
          this.isCurrentMonth = false
          this.date = ''
          this.start = dayjs().year(year).month(month - 1).startOf('month').unix() // .startOf('week').unix()
        }
        this.end = dayjs().year(year).month(month).endOf('month').unix() // .endOf('week').unix()
        await this.updateEvents()
        this.$nuxt.$loading.finish()
      })

    },
    dayChange (day) {
      this.selectedDay = day ? dayjs.tz(day).format('YYYY-MM-DD') : null
    }
  }
}
</script>
