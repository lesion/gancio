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

          //- Not logged event
          div(v-if='!$auth.loggedIn')
            v-divider <v-icon name='user-secret'/> {{$t('event.anon')}}
            p(v-html="$t('event.anon_description')")

          //- Title
          v-text-field.mb-3(
            @change='v => event.title = v'
            :value = 'event.title'
            :rules="[$validators.required('common.title')]"
            :label="$t('event.what_description')" 
            autofocus
            ref='title')

          //- Description
          Editor(
            v-model='event.description'
            :placeholder="$t('event.description_description')"
            max-height='400px')

          //- Where
          v-combobox.mt-2(v-model='event.place.name'
            :rules="[$validators.required('common.where')]"
            :label="$t('common.where')"
            :hint="$t('event.where_description')"
            persistent-hint
            :items="places"
            item-text='name'
            @change='selectPlace')
            //- template(v-slot:item="{ item }")
              v-list-item(color='primary')
                v-list-item-content(color='pink')
                  v-list-item-title {{item.name}}
                  v-list-item-subtitle {{item.address}}

          v-text-field.mt-3(ref='address'
            :rules="[$validators.required('common.address')]"
            :label="$t('common.address')"
            @change="v => event.place.address = v"
            :value="event.place.address"
            :disabled='disableAddress')

          //- When
          WhenInput(v-model='date'
            :rules="$validators.required('common.when')")

          v-row
              v-col
                v-menu(v-model='fromDateMenu'
                    :close-on-content-click="false"
                    transition="slide-x-transition"
                    ref='fromDateMenu'
                    :return-value.sync="time.start"
                    offset-y
                    absolute
                    top
                    max-width="290px"
                    min-width="290px")
                  template(v-slot:activator='{ on }')
                    v-text-field(
                      :label="$t('event.from')"
                      :rules="[$validators.required('event.from')]"
                      :value='time.start'
                      v-on='on'
                      clearable)
                  v-time-picker(
                    v-if='fromDateMenu'
                    :label="$t('event.from')"
                    format="24hr"
                    ref='time_start'
                    :allowed-minutes="[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]"
                    v-model='time.start'
                    @click:minute="$refs.fromDateMenu.save(time.start)")

              v-col
                v-menu(v-model='dueDateMenu'
                    :close-on-content-click="false"
                    transition="slide-x-transition"
                    ref='dueDateMenu'
                    :return-value.sync="time.end"
                    offset-y
                    absolute
                    top
                    max-width="290px"
                    min-width="290px")
                  template(v-slot:activator='{ on }')
                    v-text-field(
                      :label="$t('event.due')"
                      :value='time.end'
                      v-on='on'
                      clearable
                      readonly)
                  v-time-picker(
                    v-if='dueDateMenu'
                    :label="$t('event.due')"
                    format="24hr"
                    :allowed-minutes="[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]"
                    v-model='time.end'
                    @click:minute="$refs.dueDateMenu.save(time.end)")    

          //- MEDIA / FLYER / POSTER

          v-file-input(
            :label="$t('common.media')"
            :hint="$t('event.media_description')"
            prepend-icon="mdi-camera"
            v-model='event.image'
            persistent-hint
            accept='image/*')

          //- tags
          v-combobox.mt-3(v-model='event.tags'
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
import _ from 'lodash'
import dayjs from 'dayjs'
import Editor from '@/components/Editor'
import List from '@/components/List'
import ImportDialog from './ImportDialog'
import WhenInput from './WhenInput'

export default {
  name: 'NewEvent',
  components: { List, Editor, ImportDialog, WhenInput },
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
      data.event.recurrent = {}
      data.event.place.name = event.place.name
      data.event.place.address = event.place.address || ''
      if (event.multidate) {
        data.date = { start: dayjs.unix(event.start_datetime).toDate(), end: dayjs.unix(event.end_datetime).toDate() }
        data.event.type = 'multidate'
      } else if (event.recurrent) {
        data.event.type = 'recurrent'
        data.event.recurrent = event.recurrent
      } else {
        data.event.type = 'normal'
        data.date = dayjs.unix(event.start_datetime).toDate()
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
      dueDateMenu: false,
      fromDateMenu: false,
      openImportDialog: false,
      event: {
        type: 'normal',
        place: { name: '', address: '' },
        title: '',
        description: '',
        tags: [],
        image: {},
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
      disableAddress: false,
    }
  },
  computed: {
    ...mapState(['tags', 'places', 'events', 'settings']),
  },
  methods: {
    ...mapActions(['addEvent', 'updateEvent', 'updateMeta', 'updateEvents']),
    eventImported (event) {
      this.event = Object.assign(this.event, event)
    },
    selectPlace (p) {
      const place = p && this.places.find(place => place.id === p.id)
      if (place && place.address) {
        this.event.place.name = p.name
        this.event.place.address = place.address
        this.disableAddress = true
      } else {
        this.disableAddress = false
        this.event.place.address = ''
      }
      // this.$nextTick(() => this.$refs.address.focus() )
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
      if (!this.$refs.form.validate()) return
      this.loading = true
      let start_datetime, end_datetime
      const [start_hour, start_minute] = this.time.start.split(':')
      if (!this.time.end) {
        this.time.end = (Number(start_hour) + 2) + ':' + start_minute
      }
      const [end_hour, end_minute] = this.time.end.split(':')

      const formData = new FormData()

      if (this.event.type === 'multidate') {
        start_datetime = dayjs(this.date.start)
          .set('hour', start_hour).set('minute', start_minute)
        end_datetime = dayjs(this.date.end)
          .set('hour', end_hour).set('minute', end_minute)
      } else if (this.event.type === 'normal') {
        start_datetime = dayjs(this.date).set('hour', start_hour).set('minute', start_minute)
        end_datetime = dayjs(this.date).set('hour', end_hour).set('minute', end_minute)
        if (end_hour < start_hour) {
          end_datetime = end_datetime.add(1, 'day')
        }
      } else if (this.event.type === 'recurrent') {
        start_datetime = dayjs().set('hour', start_hour).set('minute', start_minute)
        end_datetime = dayjs().set('hour', end_hour).set('minute', end_minute)
        const recurrent = {
          frequency: this.event.recurrent.frequency,
          days: this.event.recurrent.type === 'ordinal' ? _.map(this.date, d => dayjs(d).date()) : _.map(this.date, d => dayjs(d).day() + 1),
          type: this.event.recurrent.type
        }
        if (end_hour < start_hour) {
          end_datetime = end_datetime.add(1, 'day')
        }
        formData.append('recurrent', JSON.stringify(recurrent))
      }

      if (this.event.image) {
        console.error(this.event.image)
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
        console.error(e.response)
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
.datePicker {
  max-width: 500px !important;
  margin: 0 auto;
}

.container {
  max-width: 1400px;
}

</style>
