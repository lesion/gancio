<template lang="pug">
v-container#home(fluid)

  //- Announcements
  #announcements.mx-1.mt-1(v-if='announcements.length')
    Announcement(v-for='announcement in announcements' :key='`a_${announcement.id}`' :announcement='announcement')

  .mb-1.mt-3.ml-2
    v-btn(v-for='cohort in cohorts' text color='primary' :key='cohort.id' :to='`g/${cohort.name}`') {{cohort.name}}

  //- Calendar and search bar
  v-row.ma-2
    #calh.col-xl-5.col-lg-5.col-md-7.col-sm-12.col-xs-12.pa-0.ma-0
      //- this is needed as v-calendar does not support SSR
      //- https://github.com/nathanreyes/v-calendar/issues/336
      client-only(placeholder='Loading...')
        Calendar(@dayclick='dayChange' @monthchange='monthChange' :events='events')

    .col.pt-0.pt-md-2
      //- v-btn(to='/search' color='primary' ) {{$t('common.search')}}
      v-form(to='/search' action='/search' method='GET')
        v-text-field(:label='$t("common.search")')
        v-btn(type='submit')
      //- Search(@tag:selected="tag => $router.push(`/tag/${tag.tag}`)")
      //- v-chip(v-if='selectedDay' close :close-icon='mdiCloseCircle' @click:close='dayChange()') {{selectedDay}}

  //- Events
  #events.mb-2.mt-1.pl-1.pl-sm-2
    Event(:event='event' @destroy='destroy' v-for='(event, idx) in visibleEvents' :lazy='idx>2' :key='event.id')
</template>

<script>
import { mapState } from 'vuex'
import dayjs from 'dayjs'
import Event from '@/components/Event'
import Announcement from '@/components/Announcement'
import Search from '@/components/Search'
import Calendar from '@/components/Calendar'
import { mdiCloseCircle } from '@mdi/js'

export default {
  name: 'Index',
  components: { Event, Search, Announcement, Calendar },
  middleware: 'setup',
  async asyncData ({ $api }) {
    const events = await $api.getEvents({
      start: dayjs().startOf('month').unix(),
      end: null,
      show_recurrent: true
    })
    return { events }
  },
  data () {
    return {
      mdiCloseCircle,
      first: true,
      cohorts: [],
      isCurrentMonth: true,
      now: dayjs().unix(),
      date: dayjs.tz().format('YYYY-MM-DD'),
      events: [],
      start: dayjs().startOf('month').unix(),
      end: null,
      selectedDay: null
    }
  },
  async fetch () {
    this.cohorts = await this.$axios.$get('cohorts')
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
        { rel: 'alternate', type: 'application/rss+xml', title: this.settings.title, href: this.settings.baseurl + '/feed/rss' }
      ]
    }
  },
  computed: {
    ...mapState(['settings', 'announcements']),
    visibleEvents () {
      const now = dayjs().unix()
      if (this.selectedDay) {
        const min = dayjs(this.selectedDay).startOf('day').unix()
        const max = dayjs(this.selectedDay).endOf('day').unix()
        return this.events.filter(e => (e.start_datetime <= max && e.start_datetime >= min))
      } else if (this.isCurrentMonth) {
        return this.events.filter(e => e.end_datetime ? e.end_datetime > now : e.start_datetime + 2 * 60 * 60 > now)
      } else {
        return this.events
      }
    }
  },
  methods: {
    destroy (id) {
      this.events = this.events.filter(e => e.id !== id)
    },
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
      this.updateEvents()
    },
    dayChange (day) {
      this.selectedDay = day ? dayjs.tz(day).format('YYYY-MM-DD') : null
    }
  }
}
</script>
