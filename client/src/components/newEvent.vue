<template lang="pug">
  b-modal(hide-header hide-footer no-close-on-backdrop
    @hide='$router.replace("/")' no-close-on-esc size='lg' :visible='true')
    h4.text-center.center {{edit?$t('Edit event'):$t('New event')}}
    b-tabs#tabss(pills v-model='activeTab')
      b-form
      b-tab
        template(slot='title')
          v-icon(name='map-marker-alt')
          span  {{$t('Where')}}
        b-card-body
          span.text-muted {{$t('where_explanation')}}
          typeahead.mb-3(v-model='event.place.name' :data='places_name' @enter='placeChoosed')
          span.text-muted {{$t('address_explanation')}}
          b-form-input(ref='address' v-model='event.place.address' @keydown.native.enter='next')
      b-tab
        template(slot='title')
          v-icon(name='clock')
          span  {{$t('When')}}
        b-card-body
          el-switch.float-right(v-model='event.multidate' :active-text="$t('multidate_explanation')")
          span.text-muted {{event.multidate ? $t('dates_explanation') : $t('date_explanation')}}
          v-date-picker.mb-3(:mode='event.multidate ? "range" : "single"' v-model='date' is-inline
            is-expanded :min-date='new Date()' @input='date ? $refs.time_start.focus() : false')
          b-row
            b-col
              label.text-muted {{$t('time_start_explanation')}}
              el-time-select(ref='time_start'
                v-model="time.start"
                :picker-options="{ start: '00:00', step: '00:30', end: '24:00'}")
            b-col.text-right
              label.text-muted {{$t('time_end_explanation')}}
              el-time-select(
                v-model='time.end'
                :picker-options="{start: '00:00', step: '00:30', end: '24:00'}"
              )
          
      b-tab
        template(slot='title')
          v-icon(name='file-alt')
          span  {{$t('What')}}
        b-card-body
          span.text-muted {{$t('what_explanation')}}
          b-form-input.mb-3(v-model.trim='event.title' autocomplete='off')
          span.text-muted {{$t('description_explanation')}}
          b-form-textarea.mb-3(v-model='event.description' :rows='3')
          span.text-muted {{$t('tag_explanation')}}
          typeahead(v-model="event.tags" :data='tags' multiple)
      b-tab
        template(slot='title')
          v-icon(name='image')
          span  {{$t('Media')}}
        b-card-body
          span.text-muted {{$t('media_explanation')}}
          b-form-file(v-model='event.image', :placeholder='$t("Poster")' accept='image/*')
      b-button(v-if='activeTab==0' variant='danger' @click='$router.go(-1)') {{$t('Cancel')}}
      b-button.float-left(v-else variant='danger' @click='prev') {{$t('Prev')}}
      b-button.float-right(v-if='activeTab<3' variant='success' @click='next' :disabled='!couldProceed') {{$t('Next')}}
      b-button.float-right(v-else variant='success' @click='done') {{edit?$t('Edit'):$t('Send')}}
</template>
<script>
import api from '@/api'
import { mapActions, mapState } from 'vuex'
import moment from 'moment'
export default {
  data() {
    return {
      event: { 
        place: { name: '', address: '' },
        title: '', description: '', tags: [],
        multidate: false,
      },
      id: null,
      activeTab: 0,
      date: null,
      time: { start: '00:00', end: null },
      edit: false
    }
  },
  name: 'newEvent',
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
      this.event.description = event.description
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
      places: state => state.places
    }),
    couldProceed () {
      switch(this.activeTab) {
        case 0:
          return this.event.place.name.length>0 && 
            this.event.place.address.length>0
        case 1:
          return true
          break
        case 2:
          return this.event.title.length>0
          break
        case 3:
          return true
          break
      }
    }
  },
  methods: {
    ...mapActions(['addEvent', 'updateEvent', 'updateMeta']),
    next () {
      this.activeTab++
    },
    prev () {
      this.activeTab--
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
          .hour(start_hour).minute(start_minute)
        end_datetime = moment(this.date.end)
          .hour(end_hour).minute(end_minute)
      } else {
        start_datetime = moment(this.date)
          .hour(start_hour).minute(start_minute)
        end_datetime = moment(this.date)
          .hour(end_hour).minute(end_minute)
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

      try {
        if (this.edit) {
          await this.updateEvent(formData)
        } else {
          await this.addEvent(formData)
        }
        this.updateMeta()
        this.$router.go(-1)
      } catch (e) {
        console.error(e)
      }
    }
  }
}
</script>

<style scope>
#tabss ul {
  justify-content: space-evenly;
  background: linear-gradient( #fff, #FFF 22px, #007bff, #fff 23px, #fff)
}

#tabss ul .nav-link {
  background-color: white;
}

#tabss ul .nav-link.active {
  background-color: #007bff;
}
</style>
