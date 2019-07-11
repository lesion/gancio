<template lang="pug">
  el-card
    nuxt-link.float-right(to='/')
      el-button(circle  icon='el-icon-close' type='danger' size='small' plain)

    h5 {{edit?$t('common.edit_event'):$t('common.add_event')}}
    el-form(v-loading='loading')
      no-ssr
        el-tabs.mb-2(v-model='activeTab')

          //- NOT LOGGED EVENT
          el-tab-pane(v-if='!$auth.loggedIn')
            span(slot='label') {{$t('event.anon')}} <v-icon name='user-secret'/>
            p(v-html="$t('event.anon_description')")
            el-button.float-right(@click='next' :disabled='!couldProceed') {{$t('common.next')}}

          //- WHAT
          el-tab-pane
            span(slot='label') {{$t('common.what')}} <v-icon name='file-alt'/>
            span {{$t('event.what_description')}}
            el-input.mb-3(v-model='event.title' ref='title')
            span {{$t('event.description_description')}}
            el-input.mb-3(v-model='event.description' type='textarea' :rows='9')
            span {{$t('event.tag_description')}}
            br
            el-select(v-model='event.tags' multiple filterable allow-create
              default-first-option placeholder='Tag')
              el-option(v-for='tag in tags' :key='tag'
                :label='tag' :value='tag')

            el-button.float-right(@click.native='next' :disabled='!couldProceed') {{$t('common.next')}}


          //- WHERE
          el-tab-pane
            span(slot='label') <v-icon name='map-marker-alt'/> {{$t('common.where')}}
            p(v-html="$t('event.where_description')")

            el-select.mb-3(v-model='event.place.name'
              @change='placeChoosed'
              filterable allow-create
              default-first-option
            )
              el-option(v-for='place in places' :label='place.name' :value='place.name' :key='place.id')
            div {{$t("common.address")}}
            el-input.mb-3(ref='address' v-model='event.place.address'
              :disabled='places_name.indexOf(event.place.name)>-1'
              @keydown.native.enter='next')
            el-button.float-right(@click='next' :disabled='!couldProceed') {{$t('common.next')}}

          //- WHEN
          el-tab-pane
            span(slot='label') {{$t('common.when')}} <v-icon name='clock'/>

            .text-center
              el-radio-group(v-model="event.type")
                el-radio-button(label="normal") <v-icon name='calendar-day'/> {{$t('event.normal')}}
                el-radio-button(label="multidate") <v-icon name='calendar-week'/> {{$t('event.multidate')}}
                el-radio-button(label="recurrent") <v-icon name='calendar-alt'/> {{$t('event.recurrent')}}
              br
              span {{$t(`event.${event.type}_description`)}}
              el-select.ml-2(v-if='event.type==="recurrent"' v-model='event.rec_frequency' placeholder='Frequenza')
                el-option(label='Tutti i giorni' value='1d' key='1d')
                el-option(label='Ogni settimana' value='1w' key='1w')
                el-option(label='Ogni due settimane' value='2w' key='2w')
                el-option(label='Ogni mese' value='1m' key='1m')
                el-option(label='Ogni due mesi' value='2m' key='2m')

            v-date-picker.mb-2.mt-3(
              :mode='event.type === "multidate" ? "range" : event.type === "recurrent" ? "multiple" : "single"'
              :attributes='attributes'
              v-model='date'
              :locale='$i18n.locale'
              :from-page.sync='page'
              is-inline
              is-expanded
              :min-date='event.type !== "recurrent" && new Date()'
            )

            div.text-center.mb-2(v-if='event.type === "recurrent"')
              span(v-if='event.rec_frequency !== "1m" && event.rec_frequency !== "2m"') {{whenPatterns}}
              el-radio-group(v-else v-model='event.rec_detail')
                el-radio-button(v-for='whenPattern in whenPatterns' :label='whenPattern.label' :key='whenPatterns.key')
                  span {{whenPattern.label}}

            el-form.text-center(inline)
              el-form-item(:label="$t('event.from')")
                el-time-select.mr-2(ref='time_start'
                  v-model="time.start"
                  :picker-options="{ start: '00:00', step: '00:30', end: '24:00'}")
              el-form-item(:label="$t('event.due')")
                el-time-select(v-model='time.end'
                  :picker-options="{start: '00:00', step: '00:30', end: '24:00'}")
            
            List(v-if='event.type==="normal"' :events='todayEvents' :title='$t("event.same_day")')
            el-button.float-right(@click='next' type='succes' :disabled='!couldProceed') {{$t('common.next')}}

          el-tab-pane
            span(slot='label') {{$t('common.media')}} <v-icon name='image'/>
            el-upload.text-center(
              action=''
              :limit="1"
              :auto-upload='false'
              drag
              :on-change='uploadedFile'
              :multiple='false'
              :file-list="fileList"
            )
              i.el-icon-upload
              div.el-upload__text {{$t('event.media_description')}}
            el-button.float-right(@click='done' :disabled='!couldProceed') {{edit?$t('common.edit'):$t('common.send')}}

</template>
<script>
import { mapActions, mapState, mapGetters } from 'vuex'
import uniq from 'lodash/uniq'
import map from 'lodash/map'
import moment from 'dayjs'
import List from '@/components/List'
import { Message } from 'element-ui'

export default {
  name: 'Add',
  components: { List },
  validate ({store}) {
    return (store.state.auth.loggedIn || store.state.settings.allow_anon_event)
  },
  data() {
    const month = moment().month()+1
    const year = moment().year()
    return {
      event: {
        type: 'normal',
        place: { name: '', address: '' },
        title: '', description: '', tags: [],
        multidate: false,
        image: false,
        recurrent: false,
        rec_frequency: '1w',
        rec_when: null,
        rec_ordinal: false,
      },
      page: { month, year},
      fileList: [],
      id: null,
      activeTab: "0",
      date: null,
      time: { start: '20:00', end: null },
      edit: false,
      loading: false
    }
  },
  name: 'newEvent',
  watch: {
    'time.start' (value) {
      if (!value) return
      let [h, m] = value.split(':')
      this.time.end = (Number(h)+1) + ':' + m
    },
    // month selected
    page () {
      this.updateEvents(this.page)
    }
  },
  async fetch ({ store, $axios }) {
    try {
      const now = new Date()
      const events = await $axios.$get(`/event/${now.getMonth()}/${now.getFullYear()}`)
      store.commit('setEvents', events)
      const { tags, places } = await $axios.$get('/event/meta')
      store.commit('update', { tags, places })
    } catch(e) {
      console.error('Error ', e)
    }
  },
  async asyncData ( { params, $axios, error }) {
    if (params.edit) {
      const data = { time: {}, event: { place: {} }}
      data.id = params.edit
      data.edit = true
      let event
      try {
        event = await $axios.$get('/event/'+ data.id)
      } catch (e) {
        error({ statusCode: 404, message: 'Event not found!'})
        return {}
      }
      data.event.place.name = event.place.name
      data.event.place.address = event.place.address || ''
      data.event.multidate = event.multidate
      if (event.multidate) {
        data.date = { start: new Date(event.start_datetime*1000), end: new Date(event.end_datetime*1000) }
      } else {
        data.date = new Date(event.start_datetime*1000)
      }
      data.time.start = moment(event.start_datetime*1000).format('HH:mm')
      data.time.end = moment(event.end_datetime*1000).format('HH:mm')
      data.event.title = event.title
      data.event.description = event.description.replace(/(<([^>]+)>)/ig, '')
      data.event.id = event.id
      if (event.tags) {
        data.event.tags = event.tags.map(t => t.tag)
      }
      return data
    }
    return {}
  },
  computed: {
    ...mapState({
      tags: state => state.tags.map(t => t.tag ),
      places_name: state => state.places.map(p => p.name ).sort((a, b) => b.weigth-a.weigth),
      places: state => state.places,
      user: state => state.user,
      events: state => state.events,
    }),
    whenPatterns () {
      const dates = this.date
      if (!dates || !dates.length) return

      const freq = this.event.rec_frequency
      const weekDays = uniq(map(dates, date => moment(date).format('dddd')))
      if (freq === '1w' || freq === '2w') {
        return this.$t(`event.recurrent_${freq}_days`, {days: weekDays.join(', ')})
      }
      if (freq === '1m' || freq === '2m') {
        const days = uniq(map(dates, date => moment(date).date()))
        const n = Math.floor((days[0]-1)/7)+1
        return [
          { label:  this.$tc(`event.recurrent_${freq}_days`, days.length, {days}) },
          { label:  this.$tc(`event.recurrent_${freq}_ordinal`, days.length, {n: this.$t(`ordinal.${n}`), days: weekDays.join(', ')}) }
        ]
      }

    },
    todayEvents () {
      if (this.event.multidate) {
        if (!this.date || !this.date.start) return
        const date_start = moment(this.date.start)
        const date_end = moment(this.date.end)
        return this.events.filter(e =>
          !e.multidate ?
          date_start.isSame(e.start_datetime*1000, 'day') || 
            date_start.isBefore(e.start_datime*1000) && date_end.isAfter(e.start_datetime*1000) :
          date_start.isSame(e.start_datetime*1000, 'day') || date_start.isSame(e.end_datetime*1000) ||
            date_start.isAfter(e.start_datetime*1000) && date_start.isBefore(e.end_datetime*1000))
      } else {
        const date = moment(this.date)
        return this.events.filter(e =>
          !e.multidate ?
            date.isSame(moment(e.start_datetime*1000), 'day') :
            moment(e.start_datetime*1000).isSame(date, 'day') ||
              moment(e.start_datetime*1000).isBefore(date) && moment(e.end_datetime*1000).isAfter(date)
        )
      }
    },
    ...mapGetters(['filteredEvents']),
    attributes () {
      let attributes = []
      attributes.push ({ key: 'today', dates: new Date(), highlight: { color: 'yellow' }})

      attributes = attributes.concat(this.filteredEvents
        .filter(e => !e.multidate)
        .map(e => ({ key: e.id, dot: {}, dates: new Date(e.start_datetime*1000)})))

      attributes = attributes.concat(this.filteredEvents
        .filter(e => e.multidate)
        .map( e => ({ key: e.id, highlight: {}, dates: { 
          start: new Date(e.start_datetime*1000), end: new Date(e.end_datetime*1000) }})))
      
      if (this.event.type==='recurrent' && this.event.rec_frequency && Array.isArray(this.date)) {
        const recurrent = {}
        if (this.event.rec_frequency === '1w') {
          recurrent.weekdays = this.date.map(d => moment(d).day()+1)
          recurrent.weeklyInterval = 1
        }
        if (this.event.rec_frequency === '2w') {
          recurrent.weekdays = this.date.map(d => moment(d).day()+1)
          recurrent.weeklyInterval = 2
          recurrent.start = new Date(this.date[0])
        }
        if (this.event.rec_frequency === '1m') {
          // recurrent.weeks = 1 
          // recurrent.ordinalWeekdays = { 1: this.date.map(d => moment(d).day()+1) }
          recurrent.days = this.date.map(d => moment(d).date())
          recurrent.monthlyInterval = 1
          recurrent.start = new Date(this.date[0])
        }
        if (this.event.rec_frequency === '2m') {
        }
        attributes.push({name: 'recurrent', dates: recurrent, dot: { color: 'red'}})
      }
      return attributes
    },
    disableAddress () {
      return this.places_name.find(p => p.name === this.event.place.name)
    },
    couldProceed () {
      const t = this.$auth.loggedIn ? -1 : 0
      switch(Number(this.activeTab)) {
        case 0+t:
          return true
        case 1+t:
          return this.event.title.length>0
        case 2+t:
          return this.event.place.name.length>0 &&
            this.event.place.address.length>0
        case 3+t:
          if (this.date && this.time.start) return true
        case 4+t:
          return this.event.place.name.length>0 &&
            this.event.place.address.length>0 &&
            (this.date && this.time.start) &&
             this.event.title.length>0
      }
    }
  },
  methods: {
    ...mapActions(['addEvent', 'updateEvent', 'updateMeta', 'updateEvents']),
    next () {
      this.activeTab = String(Number(this.activeTab)+1)
      if (this.activeTab === "2") {
        this.$refs.title.focus()
      }
    },
    prev () {
      this.activeTab = String(Number(this.activeTab-1))
    },
    placeChoosed () {
      const place = this.places.find( p => p.name === this.event.place.name )
      if (place && place.address) {
        this.event.place.address = place.address
      } else {
        this.event.place.address = ''
      }
      this.$refs.address.focus()
    },
    uploadedFile(file, fileList) {
      this.event.image = file
    },
    async done () {
      this.loading = true
      let start_datetime, end_datetime
      const [ start_hour, start_minute ] = this.time.start.split(':')
      if (!this.time.end) {
        this.time.end = (Number(start_hour)+2) + ':' + start_minute
      }
      const [ end_hour, end_minute ] = this.time.end.split(':')
      if (this.event.multidate) {
        start_datetime = moment(this.date.start)
          .set('hour', start_hour).set('minute', start_minute)
        end_datetime = moment(this.date.end)
          .set('hour', end_hour).set('minute', end_minute)
      } else {
        start_datetime = moment(this.date).set('hour', start_hour).set('minute', start_minute)
        end_datetime = moment(this.date).set('hour', end_hour).set('minute', end_minute)
      }
      const formData = new FormData()

      if (this.event.image) {
        formData.append('image', this.event.image.raw, this.event.image.name)
      }
      formData.append('title', this.event.title)
      formData.append('place_name', this.event.place.name)
      formData.append('place_address', this.event.place.address)
      formData.append('description', this.event.description)
      formData.append('multidate', this.event.multidate)
      formData.append('start_datetime', start_datetime.unix())
      formData.append('end_datetime', end_datetime.unix())

      if (this.event.type === 'recurrent') {
        const recurrent = {
          frequency: this.rec_frequency,
          days: this.rec_when,
          ordinal: this.rec_ordinal,
        }
        formData.append('recurrent', JSON.stringify(recurrent))
      }

      if (this.edit) {
        formData.append('id', this.event.id)
      }
      if (this.event.tags)
        this.event.tags.forEach(tag => formData.append('tags[]', tag))
      try {
        if (this.edit) {
          await this.updateEvent(formData)
        } else {
          await this.addEvent(formData)
        }
        this.updateMeta()
        this.$router.replace('/')
        this.loading = false
        Message({ type: 'success', showClose: true, message: this.$auth.loggedIn ? this.$t('event.added') : this.$t('event.added_anon')})
      } catch (e) {
        this.loading = false
        Message({ type: 'danger', showClose: true, message: e })
        console.error(e)
      }
    }
  }
}
</script>