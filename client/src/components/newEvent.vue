<template lang="pug">
  b-modal(ref='modal' @hidden='$router.replace("/")' size='lg' :visible='true'
    :title="edit?$t('Edit event'):$t('New event')" hide-footer)
    el-form
      el-tabs.mb-2(v-model='activeTab' v-loading='sending')

        //- NOT LOGGED EVENT
        el-tab-pane(v-if='!logged')
          span(slot='label') {{$t('anon_newevent')}} <v-icon name='user-secret'/>
          p(v-html="$t('anon_newevent_explanation')")
          el-button.float-right(@click='next' :disabled='!couldProceed') {{$t('Next')}}

        //- WHERE
        el-tab-pane
          span(slot='label') {{$t('Where')}} <v-icon name='map-marker-alt'/>
          div {{$t('where_explanation')}}
          el-select.mb-3(v-model='event.place.name' @change='placeChoosed' filterable allow-create default-first-option)
            el-option(v-for='place in places_name' :label='place' :value='place' :key='place.id')
          div {{$t("Address")}}
          el-input.mb-3(ref='address' v-model='event.place.address' @keydown.native.enter='next')
          el-button.float-right(@click='next' :disabled='!couldProceed') {{$t('Next')}}

        //- WHEN
        el-tab-pane
          span(slot='label') {{$t('When')}} <v-icon name='clock'/>
          span {{event.multidate ? $t('dates_explanation') : $t('date_explanation')}}
            el-switch.float-right(v-model='event.multidate' :active-text="$t('multidate_explanation')")
          v-date-picker.mb-3(:mode='event.multidate ? "range" : "single"' v-model='date' is-inline
            is-expanded :min-date='new Date()' @input='date ? $refs.time_start.focus() : false')
          div {{$t('time_start_explanation')}}
          el-time-select.mb-3(ref='time_start'
            v-model="time.start"
            :picker-options="{ start: '00:00', step: '00:30', end: '24:00'}")
          div {{$t('time_end_explanation')}}
          el-time-select(v-model='time.end'
            :picker-options="{start: '00:00', step: '00:30', end: '24:00'}")
          el-button.float-right(@click='next' :disabled='!couldProceed') {{$t('Next')}}

        //- WHAT
        el-tab-pane
          span(slot='label') {{$t('What')}} <v-icon name='file-alt'/>
          span {{$t('what_explanation')}}
          el-input.mb-3(v-model='event.title' ref='title')
          span {{$t('description_explanation')}}
          el-input.mb-3(v-model='event.description' type='textarea' :rows='9')
          span {{$t('tag_explanation')}}
          br 
          el-select(v-model='event.tags' multiple filterable allow-create
            default-first-option placeholder='Tag')
            el-option(v-for='tag in tags' :key='tag.tag'
              :label='tag' :value='tag') 

          el-button.float-right(@click.native='next' :disabled='!couldProceed') {{$t('Next')}}

        el-tab-pane
          span(slot='label') {{$t('Media')}} <v-icon name='image'/>
          span {{$t('media_explanation')}}
          b-form-file.mb-2(v-model='event.image', :placeholder='$t("Poster")' accept='image/*')
          el-button.float-right(@click='done') {{edit?$t('Edit'):$t('Send')}}



</template>
<script>
import api from '@/api'
import { mapActions, mapState } from 'vuex'
import moment from 'dayjs'
import Calendar from './Calendar'
import { Message } from 'element-ui'
export default {
  components: { Calendar },
  data() {
    return {
      event: { 
        place: { name: '', address: '' },
        title: '', description: '', tags: [],
        multidate: false,
      },
      visible: true,
      id: null,
      activeTab: "0",
      date: null,
      time: { start: '20:00', end: null },
      edit: false,
      sending: false,
    }
  },
  name: 'newEvent',
  watch: {
    'time.start' (value) {
      let [h, m] = value.split(':')
      this.time.end = (Number(h)+1) + ':' + m
    }
  },
  async mounted () {
    if (this.$route.params.id) {
      this.id = this.$route.params.id
      this.edit = true
      const event = await api.getEvent(this.id)
      // this.event.place = {name: event.place.name, address: event.place.address }
      this.event.place.name = event.place.name
      this.event.place.address = event.place.address || ''
      this.event.multidate = event.multidate
      this.date = event.start_datetime
      this.time.start = moment(event.start_datetime).format('HH:mm')
      this.time.end = moment(event.end_datetime).format('HH:mm')
      this.event.title = event.title
      this.event.description = event.description.replace(/(<([^>]+)>)/ig, '')
      this.event.id = event.id
      if (event.tags) {
        this.event.tags = event.tags.map(t => t.tag)
      }

    }
    this.updateMeta()
  },
  computed: {
    ...mapState({
      tags: state => state.tags.map(t => t.tag ),
      places_name: state => state.places.map(p => p.name ),
      places: state => state.places,
      user: state => state.user,
      logged: state => state.logged
    }),
    couldProceed () {
      const t = this.logged ? -1 : 0
      switch(Number(this.activeTab)) {
        case 0+t:
          return true
        case 1+t:
          return this.event.place.name.length>0 && 
            this.event.place.address.length>0
        case 2+t:
          if (this.date && this.time.start) return true
          break
        case 3+t:
          return this.event.title.length>0
          break
        case 4+t:
          return true
          break
      }
    }
  },
  methods: {
    ...mapActions(['addEvent', 'updateEvent', 'updateMeta']),
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
      }
      this.$refs.address.focus()
    },
    async done () {
      let start_datetime, end_datetime
      const [ start_hour, start_minute ] = this.time.start.split(':')
      if (!this.time.end) {
        this.time.end = this.time.start
      }
      const [ end_hour, end_minute ] = this.time.end.split(':')
      if (this.event.multidate) {
        start_datetime = moment(this.date.start)
          .set('hour', start_hour).set('minute', start_minute)
        end_datetime = moment(this.date.end)
          .set('hour', end_hour).set('minute', end_minute)
      } else {
        console.log(this.date)
        start_datetime = moment(this.date).set('hour', start_hour).set('minute', start_minute)
        end_datetime = moment(this.date).set('hour', end_hour).set('minute', end_minute)
      }
      const formData = new FormData()

      if (this.event.image) {
        formData.append('image', this.event.image, this.event.image.name)
      }
      formData.append('title', this.event.title)
      formData.append('place_name', this.event.place.name)
      formData.append('place_address', this.event.place.address)
      formData.append('description', this.event.description)
      formData.append('multidate', this.event.multidate)
      formData.append('start_datetime', start_datetime)
      formData.append('end_datetime', end_datetime)
      if (this.edit) {
        formData.append('id', this.event.id)
      }
      if (this.event.tags)
        this.event.tags.forEach(tag => formData.append('tags[]', tag))
      this.sending = true
      try {
        if (this.edit) {
          await this.updateEvent(formData)
        } else {
          await this.addEvent(formData)
        }
        this.updateMeta()
        this.sending = false
        this.$refs.modal.hide()
        Message({ type: 'success', message: this.logged ? this.$t('new_event_added') : this.$t('new_anon_event_added')})
      } catch (e) {
        this.sending = false
        console.error(e)
      }
    }
  }
}
</script>