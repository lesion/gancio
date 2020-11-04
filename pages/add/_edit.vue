<template lang="pug">
  v-container.container
    v-card
      v-card-title
        h4 {{edit?$t('common.edit_event'):$t('common.add_event')}}
        v-spacer
        v-btn(link text color='primary' @click='openImportDialog=true')
          <v-icon>mdi-file-import</v-icon> {{$t('common.import')}}
      v-dialog(v-model='openImportDialog')
        ImportDialog(@close='openImportDialog=false' @imported='eventImported')

      v-card-text
        v-form(v-model='valid' ref='form' lazy-validation)
          v-container
            v-row
              //- Not logged event
              v-col.col-12(v-if='!$auth.loggedIn')
                v-divider <v-icon name='user-secret'/> {{$t('event.anon')}}
                p(v-html="$t('event.anon_description')")

              //- Title
              v-text-field.col-12(
                @change='v => event.title = v'
                :value = 'event.title'
                :rules="[$validators.required('common.title')]"
                :hint="$t('event.what_description')"
                prepend-icon='mdi-format-title'
                :label="$t('common.title')"
                autofocus
                ref='title')

              //- Where
              WhereInput.col-12(v-model='event.place')

              //- When
              DateInput.col-12(v-model='date')
              HourInput.col-12(v-model='time')

              //- Description
              Editor.col-12.mb-3(
                v-model='event.description'
                :placeholder="$t('event.description_description')"
                max-height='400px')

              //- MEDIA / FLYER / POSTER

              v-file-input.col-6.mt-3(
                :label="$t('common.media')"
                :hint="$t('event.media_description')"
                prepend-icon="mdi-camera"
                v-model='event.image'
                persistent-hint
                accept='image/*')

              //- tags
              v-combobox.col-6.mt-3(v-model='event.tags'
                prepend-icon="mdi-tag-multiple"
                chips small-chips multiple deletable-chips hide-no-data hide-selected persistent-hint
                :delimiters="[',', ' ']"
                :items="tags.map(t => t.tag)"
                :label="$t('common.tags')")

      v-card-actions
        v-spacer
        v-btn(@click='done' :loading='loading' :disabled='!valid || loading'
          color='primary') {{edit?$t('common.edit'):$t('common.send')}}

</template>
<script>
import { mapActions, mapState } from 'vuex'
import dayjs from 'dayjs'
import Editor from '@/components/Editor'
import List from '@/components/List'
import ImportDialog from './ImportDialog'
import DateInput from './DateInput'
import HourInput from './HourInput'
import WhereInput from './WhereInput'

export default {
  name: 'NewEvent',
  components: { List, Editor, ImportDialog, WhereInput, HourInput, DateInput },
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
      data.date = {}
      if (event.multidate) {
        data.date = {
          type: 'multidate',
          start: dayjs.unix(event.start_datetime).toDate(),
          end: dayjs.unix(event.end_datetime).toDate()
        }
      } else if (event.recurrent) {
        data.date.type = 'recurrent'
        data.date.recurrent = event.recurrent
      } else {
        data.date.type = 'normal'
        data.date.date = dayjs.unix(event.start_datetime).format('YYYY-MM-DD')
      }

      data.time.start = dayjs.unix(event.start_datetime).format('HH:mm')
      data.time.end = dayjs.unix(event.end_datetime).format('HH:mm')

      data.event.title = event.title
      data.event.description = event.description
      data.event.id = event.id
      data.event.tags = event.tags
      return data
    }
    return {}
  },
  data () {
    const month = dayjs().month() + 1
    const year = dayjs().year()
    return {
      valid: false,
      openImportDialog: false,
      event: {
        type: 'normal',
        place: { name: '', address: '' },
        title: '',
        description: '',
        tags: [],
        image: null,
        recurrent: { frequency: '1m', days: [], type: 'weekday_desc' }
      },
      page: { month, year },
      fileList: [],
      id: null,
      date: { type: 'normal', recurrent: {} },
      time: { start: null, end: null },
      edit: false,
      loading: false,
      mediaUrl: '',
      disableAddress: false
    }
  },
  computed: {
    ...mapState(['tags', 'places', 'events', 'settings'])
  },
  methods: {
    ...mapActions(['addEvent', 'updateEvent', 'updateMeta', 'updateEvents']),
    eventImported (event) {
      this.event = Object.assign(this.event, event)
    },
    // recurrentDays () {
    //   if (this.event.type !== 'recurrent' || !this.date || !this.date.length) { return }
    //   const type = this.event.recurrent.type
    //   if (type === 'ordinal') { return map(this.date, d => dayjs(d).date()) } else if (type === 'weekday') { return map(this.date, d => dayjs(d).day() + 1) }
    // },
    // },
    cleanFile () {
      this.event.image = {}
    },
    async done () {
      if (!this.$refs.form.validate()) { return }
      this.loading = true
      let start_datetime, end_datetime
      const [start_hour, start_minute] = this.time.start.split(':')
      if (!this.time.end) {
        this.time.end = (Number(start_hour) + 2) + ':' + start_minute
      }
      const [end_hour, end_minute] = this.time.end.split(':')

      const formData = new FormData()

      if (this.date.type === 'multidate') {
        start_datetime = dayjs(this.date.date[0])
          .set('hour', start_hour).set('minute', start_minute)
        end_datetime = dayjs(this.date.date[1])
          .set('hour', end_hour).set('minute', end_minute)
      } else if (this.date.type === 'normal') {
        start_datetime = dayjs(this.date.date).set('hour', start_hour).set('minute', start_minute)
        end_datetime = dayjs(this.date.date).set('hour', end_hour).set('minute', end_minute)
        if (end_hour < start_hour) {
          end_datetime = end_datetime.add(1, 'day')
        }
      } else if (this.date.type === 'recurrent') {
        start_datetime = dayjs().set('hour', start_hour).set('minute', start_minute)
        end_datetime = dayjs().set('hour', end_hour).set('minute', end_minute)
        // const recurrent = {
        //   frequency: this.event.recurrent.frequency,
        //   days: this.event.recurrent.type === 'ordinal' ? _.map(this.date, d => dayjs(d).date()) : _.map(this.date, d => dayjs(d).day() + 1),
        //   type: this.event.recurrent.type
        // }
        if (end_hour < start_hour) {
          end_datetime = end_datetime.add(1, 'day')
        }
        formData.append('recurrent', JSON.stringify(this.date.recurrent))
      }

      if (this.event.image) {
        formData.append('image', this.event.image)
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
      if (this.event.tags) { this.event.tags.forEach(tag => formData.append('tags[]', tag.tag || tag)) }
      try {
        if (this.edit) {
          await this.updateEvent(formData)
        } else {
          await this.addEvent(formData)
        }
        this.updateMeta()
        this.$router.replace('/')
        this.loading = false
        this.$root.$message(this.$auth.loggedIn ? 'event.added' : 'event.added_anon', { color: 'success' })
      } catch (e) {
        switch (e.request.status) {
          case 413:
            this.$root.$message('event.image_too_big', { color: 'error' })
            break
          default:
            this.$root.$message(e.response.data, { color: 'error' })
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
.container {
  max-width: 1400px;
}

</style>
