<template lang="pug">
  el-main#edit_page
    h5.text-center {{edit?$t('common.edit_event'):$t('common.add_event')}}
    el-form(v-loading='loading')

      //- NOT LOGGED EVENT
      div(v-if='!$auth.loggedIn')
        el-divider <v-icon name='user-secret'/> {{$t('event.anon')}}
        p(v-html="$t('event.anon_description')")

      //- title
      span {{$t('event.what_description')}}
      el-input.mb-3(v-model='event.title' ref='title' autofocus)

      //- description
      span {{$t('event.description_description')}}
      Editor.mb-3(v-model='event.description' border no-save style='max-height: 400px;')

      //- tags
      div {{$t('event.tag_description')}}
      client-only
        el-select.mb-3(v-model='event.tags' multiple filterable
          @input.native='queryTags=$event.target.value' @change='queryTags=""'
          allow-create default-first-option placeholder='Tag')
          el-option(v-for='tag in filteredTags' :key='tag.tag' :label='tag.tag' :value='tag.tag')

      //- WHERE
      el-divider
        i.el-icon-location-outline
        span {{$t('common.where')}}
      p(v-html="$t('event.where_description')")

      el-autocomplete(v-model='event.place.name' @blur='selectPlace($event.target.value)'
        highlight-first-item
        :fetch-suggestions='filterPlaces' @select='selectPlace')

      div {{$t("common.address")}}
      el-input.mb-3(ref='address' v-model='event.place.address' :disabled='disableAddress')

      //- WHEN
      el-divider <v-icon name='clock'/> {{$t('common.when')}}

      .text-center
        el-radio-group(v-model="event.type")
          el-radio-button(label="normal") <v-icon name='calendar-day'/> {{$t('event.normal')}}
          el-radio-button(label="multidate") <v-icon name='calendar-week'/> {{$t('event.multidate')}}
          el-radio-button(v-if='settings.allow_recurrent_event' label="recurrent") <v-icon name='calendar-alt'/> {{$t('event.recurrent')}}
        br
        span {{$t(`event.${event.type}_description`)}}
        el-select.ml-2(v-if='event.type==="recurrent"' v-model='event.recurrent.frequency' placeholder='Frequenza')
          el-option(:label="$t('event.each_week')" value='1w' key='1w')
          el-option(:label="$t('event.each_2w')" value='2w' key='2w')
          //- el-option(:label="$t('event.each_month')" value='1m' key='1m')

      client-only
        #picker.mx-auto
          v-date-picker.mb-2.mt-3(
            :mode='event.type === "multidate" ? "range" : event.type === "recurrent" ? "multiple" : "single"'
            :attributes='attributes'
            v-model='date'
            :locale='$i18n.locale'
            :from-page.sync='page'
            is-inline
            is-expanded
            :min-date='event.type !== "recurrent" && new Date()')

      div.text-center.mb-2(v-if='event.type === "recurrent"')
        span(v-if='event.recurrent.frequency !== "1m" && event.recurrent.frequency !== "2m"') {{whenPatterns}}
        el-radio-group(v-else v-model='event.recurrent.type')
          el-radio-button(v-for='whenPattern in whenPatterns' :label='whenPattern.key' :key='whenPatterns.key')
            span {{whenPattern.label}}

        //- form.el-form.text-center.inline.el-form-inline
      .text-center
        el-form-item(:label="$t('event.from')" width='100')
          el-time-select.mr-2(ref='time_start'
            v-model="time.start"
            :picker-options="{ start: '00:00', step: '00:30', end: '24:00'}")
        el-form-item(:label="$t('event.due')")
          el-time-select(v-model='time.end'
            :picker-options="{start: '00:00', step: '00:30', end: '24:00'}")

      List(v-if='event.type==="normal" && todayEvents.length' :events='todayEvents' :title='$t("event.same_day")')

      //- MEDIA / FLYER / POSTER
      el-divider <v-icon name='image'/> {{$t('common.media')}}

      div.mb-2 {{$t('event.media_description')}}
      //- img(:src='mediaUrl' @load='imageLoaded')
      el-upload.text-center(
        action=''
        :limit="1"
        :auto-upload='false'
        drag
        accept='image/*'
        :on-remove='cleanFile'
        :on-change='uploadedFile'
        :multiple='false')
        i.el-icon-upload
      //- el-input(v-model='mediaUrl')
      el-button.mt-2.float-right(@click='done' :disabled='!couldProceed') {{edit?$t('common.edit'):$t('common.send')}}

</template>
<script>
import { mapActions, mapState } from 'vuex'
import _ from 'lodash'
import moment from 'moment-timezone'
import Editor from '@/components/Editor'
import List from '@/components/List'
import { Message } from 'element-ui'

export default {
  name: 'NewEvent',
  components: { List, Editor },
  validate ({ store }) {
    return (store.state.auth.loggedIn || store.state.settings.allow_anon_event)
  },
  async asyncData ({ params, $axios, error, store }) {
    if (params.edit) {
      const data = { time: {}, event: { place: {} } }
      data.id = params.edit
      data.edit = true
      let event
      try {
        event = await $axios.$get('/event/' + data.id)
      } catch (e) {
        error({ statusCode: 404, message: 'Event not found!' })
        return {}
      }

      data.event.place.name = event.place.name
      data.event.place.address = event.place.address || ''
      if (event.multidate) {
        data.date = { start: moment.unix(event.start_datetime), end: moment.unix(event.end_datetime) }
        data.event.type = 'multidate'
      } else if (event.recurrent) {
        data.event.type = 'recurrent'
        data.event.recurrent = JSON.parse(event.recurrent)
      } else {
        data.event.type = 'normal'
        data.date = moment.unix(event.start_datetime)
      }

      data.time.start = moment.unix(event.start_datetime).format('HH:mm')
      data.time.end = moment.unix(event.end_datetime).format('HH:mm')
      data.event.title = event.title
      data.event.description = event.description
      data.event.id = event.id
      data.event.recurrent = {}
      data.event.tags = event.tags
      return data
    }
    return {}
  },
  data () {
    const month = moment().month() + 1
    const year = moment().year()
    return {
      event: {
        type: 'normal',
        place: { name: '', address: '' },
        title: '',
        description: '',
        tags: [],
        image: false,
        recurrent: { frequency: '1w', days: [], type: 'weekday' }
      },
      page: { month, year },
      fileList: [],
      id: null,
      date: null,
      time: { start: '20:00', end: null },
      edit: false,
      loading: false,
      mediaUrl: '',
      queryTags: '',
      disableAddress: true
    }
  },
  computed: {
    ...mapState(['tags', 'places', 'events', 'settings']),
    whenPatterns () {
      const dates = this.date
      if (!dates || !dates.length) { return '' }

      const freq = this.event.recurrent.frequency
      const weekDays = _(dates).map(date => moment(date).format('dddd')).uniq()
      if (freq === '1w' || freq === '2w') {
        return this.$t(`event.recurrent_${freq}_days`, { days: weekDays.join(', ') })
      } else if (freq === '1m' || freq === '2m') {
        const days = _(dates).map(date => moment(date).date()).uniq()
        const n = Math.floor((days[0] - 1) / 7) + 1
        return [
          { label: this.$tc(`event.recurrent_${freq}_days`, days.length, { days }), key: 'ordinal' },
          { label: this.$tc(`event.recurrent_${freq}_ordinal`, days.length, { n: this.$t(`ordinal.${n}`), days: weekDays.join(', ') }), key: 'weekday' }
        ]
      } else if (freq === '1d') {
        return this.$t('event.recurrent_each_day')
      }
      return ''
    },
    todayEvents () {
      if (this.event.type === 'multidate') {
        if (!this.date || !this.date.start) { return }
        const date_start = moment(this.date.start)
        const date_end = moment(this.date.end)
        return this.events.filter(e =>
          !e.multidate
            ? date_start.isSame(moment.unix(e.start_datetime), 'day') ||
            (date_start.isBefore(moment.unix(e.start_dateime)) && date_end.isAfter(moment.unix(e.start_datetime)))
            : date_start.isSame(moment.unix(e.start_datetime), 'day') || date_start.isSame(moment.unix(e.end_datetime)) ||
            (date_start.isAfter(moment.unix(e.start_datetime)) && date_start.isBefore(moment.unix(e.end_datetime))))
      } else if (this.event.type === 'recurrent') {
        return []
      } else {
        const date = moment(this.date)
        return this.events.filter(e =>
          !e.multidate
            ? !e.recurrent && date.isSame(moment.unix(e.start_datetime), 'day')
            : moment.unix(e.start_datetime).isSame(date, 'day') ||
              (moment.unix(e.start_datetime).isBefore(date) && moment.unix(e.end_datetime).isAfter(date))
        )
      }
    },
    ...mapState(['events']),
    attributes () {
      let attributes = []
      attributes.push({ key: 'today', dates: new Date(), highlight: { color: 'red' } })

      attributes = attributes.concat(this.events
        .filter(e => !e.multidate && (!e.recurrent || this.event.type === 'recurrent'))
        .map(e => ({ key: e.id, dot: { color: this.event.type === 'recurrent' ? 'orange' : 'green' }, dates: moment.unix(e.start_datetime).toDate() })))

      console.error(this.event.type)
      if (this.event.type === 'recurrent' && this.date && this.date.length) {
        attributes.push({
          key: 'recurrent',
          dot: { color: 'orange' },
          dates: {
            weeklyInterval: this.event.recurrent.frequency === '1w' ? 1 : 2, // this.event.recurrent.freq,
            weekdays: _.map(this.date, date => moment(date).day() + 1),
            start: new Date(this.date[0])
          }
        })
      }
      attributes = attributes.concat(this.events
        .filter(e => e.multidate && !e.recurrent)
        .map(e => ({
          key: e.id,
          highlight: {},
          dates: { start: moment.unix(e.start_datetime).toDate(), end: moment.unix(e.end_datetime).toDate() }
        })))

      return attributes
    },
    filteredTags () {
      const queryTags = this.queryTags.toLowerCase()
      return _(this.tags)
        .filter(t => !this.event.tags.includes(t.tag))
        .filter(t => t.tag.includes(queryTags))
        // .pick('tag')
        .take(5)
        .value()
    },
    couldProceed () {
      return (this.event.place.name.length > 0 &&
        this.event.place.address.length > 0 &&
        (this.date && this.time.start) &&
          this.event.title.length > 0)
    }
  },
  mounted () {
    this.$refs.title.focus()
  },
  methods: {
    ...mapActions(['addEvent', 'updateEvent', 'updateMeta', 'updateEvents']),
    filterPlaces (q, cb) {
      const query = q.toLowerCase()
      const ret = _(this.places)
        .filter(p => p.name.toLowerCase().includes(query))
        .take(5)
        .map(p => ({ value: p.name }))
        .value()
      ret.unshift({ value: q })
      cb(ret)
    },
    selectPlace (p) {
      const place = this.places.find(p => p.name === this.event.place.name)
      if (place && place.address) {
        this.event.place.address = place.address
        this.disableAddress = true
      } else {
        this.disableAddress = false
        this.event.place.address = ''
      }
      this.$nextTick(this.$refs.address.focus)
    },
    // recurrentDays () {
    //   if (this.event.type !== 'recurrent' || !this.date || !this.date.length) { return }
    //   const type = this.event.recurrent.type
    //   if (type === 'ordinal') { return map(this.date, d => moment(d).date()) } else if (type === 'weekday') { return map(this.date, d => moment(d).day() + 1) }
    // },
    // },
    cleanFile () {
      this.event.image = null
    },
    uploadedFile (file, fileList) {
      if (file.size / 1024 / 1024 > 4) {
        Message({ type: 'warning', showClose: true, message: this.$tc('event.image_too_big') })
        this.fileList = []
        return false
      }
      this.fileList = [{ name: file.name, url: file.url }]
      this.event.image = file
    },
    async done () {
      this.loading = true
      let start_datetime, end_datetime
      const [start_hour, start_minute] = this.time.start.split(':')
      if (!this.time.end) {
        this.time.end = (Number(start_hour) + 2) + ':' + start_minute
      }
      const [end_hour, end_minute] = this.time.end.split(':')

      const formData = new FormData()

      if (this.event.type === 'multidate') {
        start_datetime = moment(this.date.start)
          .set('hour', start_hour).set('minute', start_minute)
        end_datetime = moment(this.date.end)
          .set('hour', end_hour).set('minute', end_minute)
      } else if (this.event.type === 'normal') {
        start_datetime = moment(this.date).set('hour', start_hour).set('minute', start_minute)
        end_datetime = moment(this.date).set('hour', end_hour).set('minute', end_minute)
        if (end_hour < start_hour) {
          end_datetime = end_datetime.add(1, 'day')
        }
      } else if (this.event.type === 'recurrent') {
        start_datetime = moment().set('hour', start_hour).set('minute', start_minute)
        end_datetime = moment().set('hour', end_hour).set('minute', end_minute)
        const recurrent = {
          frequency: this.event.recurrent.frequency,
          days: this.event.recurrent.type === 'ordinal' ? _.map(this.date, d => moment(d).date()) : _.map(this.date, d => moment(d).day() + 1),
          type: this.event.recurrent.type
        }
        if (end_hour < start_hour) {
          end_datetime = end_datetime.add(1, 'day')
        }
        formData.append('recurrent', JSON.stringify(recurrent))
      }

      if (this.event.image) {
        formData.append('image', this.event.image.raw, this.event.image.name)
      }
      formData.append('title', this.event.title)
      formData.append('place_name', this.event.place.name)
      formData.append('place_address', this.event.place.address)
      formData.append('description', this.event.description)
      formData.append('multidate', this.event.type === 'multidate')
      formData.append('start_datetime', start_datetime.unix())
      formData.append('end_datetime', end_datetime.unix())

      if (this.edit) {
        formData.append('id', this.event.id)
      }
      if (this.event.tags) { this.event.tags.forEach(tag => formData.append('tags[]', tag)) }
      try {
        if (this.edit) {
          await this.updateEvent(formData)
        } else {
          await this.addEvent(formData)
        }
        this.updateMeta()
        this.$router.replace('/')
        this.loading = false
        Message({ type: 'success', showClose: true, message: this.$auth.loggedIn ? this.$t('event.added') : this.$t('event.added_anon') })
      } catch (e) {
        console.error(e.response)
        switch (e.request.status) {
          case 413:
            Message({ type: 'error', showClose: true, message: this.$t('event.image_too_big') })
            break
          default:
            Message({ type: 'error', showClose: true, message: e.response.data })
        }
        this.loading = false
      }
    }
  },
  head () {
    return {
      title: `${this.settings.title} - ${this.$t('common.add_event')}`
    }
  }
}
</script>
<style style='less'>

i {
  font-size: 1.3em;
}

#add_event {
  max-width: 800px;
}

#picker {
  max-width: 600px;
}

#edit_page .el-form-item {
    display: inline-flex;
}

.el-upload,
.el-upload-dragger {
  overflow: hidden;
  text-align: center;
  margin: 0 auto;
  max-width: 80%;
}
</style>
