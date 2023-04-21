<template lang="pug">
v-container.px-2.px-sm-6.pt-0#home

  //- View
  #themeview.mt-sm-4.mt-2
    ThemeView

  //- Announcements
  #announcements.mt-2.mt-sm-4(v-if='announcements.length')
    Announcement(v-for='announcement in announcements' :key='`a_${announcement.id}`' :announcement='announcement')

  //- Events
  #events.mt-sm-4.mt-2(v-if='!$fetchState.pending')
    v-lazy.event.v-card(:value='idx<9' v-for='(event, idx) in visibleEvents' :key='event.id' :min-height='hide_thumbs ? 105 : undefined' :options="{ threshold: .5, rootMargin: '500px' }" :class="{ 'theme--dark': is_dark }")
      Event(:event='event' :lazy='idx>9')
  .text-center(v-else)
    v-progress-circular.justify-center.align-center(color='primary' indeterminate model-value='20')

</template>

<script>
import { mapState, mapActions, mapGetters  } from 'vuex'
import { DateTime } from 'luxon'
import Event from '@/components/Event'
import Announcement from '@/components/Announcement'
import ThemeView from '@/components/ThemeView'
import { mdiMagnify, mdiCloseCircle } from '@mdi/js'

export default {
  name: 'Index',
  components: { Event, Announcement, ThemeView },
  middleware: 'setup',
  fetch () {
    if (this.filter.query) {
      return this.getEvents({
        query: this.filter.query,
        older: true
      })
    } else {
      return this.getEvents({
        start: this.start,
        end: this.end,
      })
    }
  },
  data ({ $time }) {
    return {
      mdiMagnify, mdiCloseCircle,
      isCurrentMonth: true,
      now: $time.nowUnix(),
      start: $time.startMonth(),
      end: null,
      tmpEvents: [],
      selectedDay: null,
      storeUnsubscribe: null,
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
    ...mapState(['settings', 'announcements', 'events', 'filter']),
    ...mapGetters(['hide_thumbs', 'is_dark']),
    visibleEvents () {
      const now = this.$time.nowUnix()
      if (this.selectedDay) {
        const min = this.selectedDay.startOf('day').toUnixInteger()
        const max = this.selectedDay.endOf('day').toUnixInteger()
        return this.events.filter(e => (e.start_datetime <= max && (e.end_datetime || e.start_datetime) >= min) && (this.filter.show_recurrent || !e.parentId))
      } else if (this.isCurrentMonth && !this.filter.query) {
          return this.events.filter(e => ((e.end_datetime ? e.end_datetime >= now : e.start_datetime + 3 * 60 * 60 >= now) && (this.filter.show_recurrent || !e.parentId)))
      } else {
        return this.events.filter(e => this.filter.show_recurrent || !e.parentId)
      }
    }
  },
  created () {
    this.$root.$on('dayclick', this.dayChange)
    this.$root.$on('monthchange', this.monthChange)
    if (process.client) {
      this.storeUnsubscribe = this.$store.subscribeAction( { after: (action, state) => {
        if (action.type === 'setFilter') { this.$fetch() }
      }})
    }
  },
  destroyed () {
    this.$root.$off('dayclick')
    this.$root.$off('monthchange')
    if (typeof this.storeUnsubscribe === 'function') {
      this.storeUnsubscribe()
    }
  },
  methods: {
    ...mapActions(['getEvents']),
    async monthChange ({ year, month }) {
      if (this.filter.query) return
      this.$nuxt.$loading.start()
      let isCurrentMonth

      // unselect current selected day
      this.selectedDay = null
      const now = DateTime.local({zone: this.settings.instance_timezone})
      // check if current month is selected
      if (month === now.month && year === now.year) {
        isCurrentMonth = true
        this.start = now.startOf('month').toUnixInteger()
        this.end = null
      } else {
        isCurrentMonth = false
        this.start = DateTime.local(year, month, { zone: this.settings.instance_timezone }).toUnixInteger()
        this.end = DateTime.local(year, month, { zone: this.settings.instance_timezone }).plus({ month: !this.$vuetify.breakpoint.smAndDown ? 1 : 0 }).endOf('month').toUnixInteger() // .endOf('week').unix()
      }
      await this.$fetch()
      this.$nuxt.$loading.finish()
      this.$nextTick( () => this.isCurrentMonth = isCurrentMonth)

    },
    dayChange (day) {
      if (!day) {
        this.selectedDay = null
        return
      }
      const date = DateTime.fromJSDate(day)
      this.selectedDay = day ? DateTime.local({ zone: this.settings.instance_timezone }).set({ year: date.year, month: date.month, day: date.day}) : null
    }
  }
}
</script>
