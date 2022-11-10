<template lang="pug">
v-container.px-2.px-sm-6.pt-0
  div(v-if='collections.length')
    v-btn.mr-2(outlined v-for='collection in collections' color='primary' :key='collection.id' :to='`/collection/${collection.name}`') {{collection.name}}

  //- Announcements
  #announcements.mt-2.mt-sm-4(v-if='announcements.length')
    Announcement(v-for='announcement in announcements' :key='`a_${announcement.id}`' :announcement='announcement')

  //- Calendar and search bar
  //- v-row.ma-2(v-if='!settings.hide_calendar')
    //- .calh.col-xl-5.col-lg-5.col-md-7.col-sm-10.col-xs-12.pa-0.mx-sm-2.mx-0.my-0.mt-sm-2
  .calh.mt-2.mt-sm-4(v-if='!settings.hide_calendar')
    //- this is needed as v-calendar does not support SSR
    //- https://github.com/nathanreyes/v-calendar/issues/336
    client-only(placeholder='Loading...')
      Calendar(@dayclick='dayChange' @monthchange='monthChange' :events='events')

    //- .col.pt-0.pt-md-2.mt-4.ma-md-0.pb-0
    //-   //- v-btn(to='/search' color='primary' ) {{$t('common.search')}}
    //-   v-form(to='/search' action='/search' method='GET')
    //-     v-col(cols=12)
    //-       v-switch(
    //-         v-if='settings.allow_recurrent_event'
    //-         v-model='show_recurrent'
    //-         inset color='primary'
    //-         hide-details
    //-         :label="$t('event.show_recurrent')")      
    //-     v-col.mb-4(cols=12)
    //-       v-text-field(name='search' :label='$t("common.search")' outlined rounded hide-details :append-icon='mdiMagnify')
      v-chip(v-if='selectedDay' close :close-icon='mdiCloseCircle' @click:close='dayChange()') {{selectedDay}}


  //- Events
  #events.mt-sm-4.mt-2
    Event(:event='event' @destroy='destroy' v-for='(event, idx) in visibleEvents' :lazy='idx>2' :key='event.id')
</template>

<script>
import { mapState } from 'vuex'
import dayjs from 'dayjs'
import Event from '@/components/Event'
import Announcement from '@/components/Announcement'
import Calendar from '@/components/Calendar'
import { mdiMagnify, mdiCloseCircle } from '@mdi/js'

export default {
  name: 'Index',
  components: { Event, Announcement, Calendar },
  middleware: 'setup',
  async asyncData ({ $api, $axios }) {
    const  [collections, events] = await Promise.all([
        $axios.$get('collections').catch(_e => []),
        $api.getEvents({
          start: dayjs().startOf('month').unix(),
          end: null,
          show_recurrent: true
        })])
    return { events, collections }
  },
  data ({ $store }) {
    return {
      mdiMagnify, mdiCloseCircle,
      isCurrentMonth: true,
      now: dayjs().unix(),
      date: dayjs.tz().format('YYYY-MM-DD'),
      events: [],
      start: dayjs().startOf('month').unix(),
      end: null,
      selectedDay: null,
      show_recurrent: $store.state.settings.recurrent_event_visible,
      collections: []
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
    ...mapState(['settings', 'announcements']),
    visibleEvents () {
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
