<template lang="pug">
  b-modal(ref='modal' @hidden='$router.replace("/")' size='lg' :visible='true'
    :title="edit?$t('common.edit_event'):$t('common.add_event')" hide-footer)
    el-form
      el-tabs.mb-2(v-model='activeTab' v-loading='sending')

        //- NOT LOGGED EVENT
        el-tab-pane(v-if='!$auth.loggedIn')
          span(slot='label') {{$t('event.anon')}} <v-icon name='user-secret'/>
          p(v-html="$t('event.anon_description')")
          el-button.float-right(@click='next' :disabled='!couldProceed') {{$t('common.next')}}

        //- WHERE
        el-tab-pane
          span(slot='label') {{$t('common.where')}} <v-icon name='map-marker-alt'/>
          div {{$t('common.where')}}
            el-popover(
              placement="top-start"
              width="400"
              trigger="hover")
              v-icon(slot='reference' color='#ff9fc4' name='question-circle')
              slot
                p {{$t('event.where_description')}}
          el-select.mb-3(v-model='event.place.name' @change='placeChoosed' filterable allow-create default-first-option)
            el-option(v-for='place in places_name' :label='place' :value='place' :key='place.id')
          div {{$t("common.address")}}
          el-input.mb-3(ref='address' v-model='event.place.address' :disabled='places_name.indexOf(event.place.name)>-1' @keydown.native.enter='next')
          el-button.float-right(@click='next' :disabled='!couldProceed') {{$t('common.next')}}

        //- WHEN
        el-tab-pane
          span(slot='label') {{$t('common.when')}} <v-icon name='clock'/>
          span {{event.multidate ? $t('event.dates_description') : $t('event.date_description')}}
            el-switch.float-right(v-model='event.multidate' :active-text="$t('event.multidate_description')")
          v-date-picker.mb-3(:mode='event.multidate ? "range" : "single"' v-model='date' is-inline
            is-expanded :min-date='new Date()' @input='date ? $refs.time_start.focus() : false')
          div {{$t('event.time_start_description')}}
          el-time-select.mb-3(ref='time_start'
            v-model="time.start"
            :picker-options="{ start: '00:00', step: '00:30', end: '24:00'}")
          div {{$t('event.time_end_description')}}
          el-time-select(v-model='time.end'
            :picker-options="{start: '00:00', step: '00:30', end: '24:00'}")
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
            el-option(v-for='tag in tags' :key='tag.tag'
              :label='tag' :value='tag') 

          el-button.float-right(@click.native='next' :disabled='!couldProceed') {{$t('common.next')}}

        el-tab-pane
          span(slot='label') {{$t('common.media')}} <v-icon name='image'/>
          span {{$t('event.media_description')}}
          b-form-file.mb-2(v-model='event.image', :placeholder='$t("common.poster")' accept='image/*')
          el-button.float-right(@click='done') {{edit?$t('common.edit'):$t('common.send')}}



</template>
<script>
// import api from '@/plugins/api'
import { mapActions, mapState } from 'vuex'
import moment from 'dayjs'
import Calendar from '@/components/Calendar'
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
    }),
    disableAddress () {
      console.log('dentro disable Address')
      const ret = this.places_name.find(p => p.name === this.event.place.name)
      console.log(ret)
      return ret
    },
    couldProceed () {
      const t = this.$auth.loggedIn ? -1 : 0
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
        Message({ type: 'success', message: this.$auth.loggedIn ? this.$t('event.added') : this.$t('event.added_anon')})
      } catch (e) {
        this.sending = false
        console.error(e)
      }
    }
  }
}
</script>