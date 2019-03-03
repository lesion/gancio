<template lang="pug">
  b-modal(hide-footer hide-header
    @hide='$router.replace("/")' size='lg' :visible='true' v-if='type')
    h3.text-center Export
    p {{$t('export_intro')}}
    
    li(v-if='filters.tags.length') {{$t('Tags')}}:
      b-badge.ml-1(:style='{backgroundColor: tag.color}' v-for='tag in filters.tags') {{tag}}
    li(v-if='filters.places.length') {{$t('Places')}}:
      b-badge.ml-1(v-for='place in filters.places') {{place}}
    b-tabs(pills vertical)
      b-tab.pt-1(title='feed rss' :active="type === 'feed'" @click='type="feed"')
        p(v-html='$t(`export_feed_explanation`)')
        b-input-group.mb-2(v-if='showLink')
          b-form-input( v-model='link' autocomplete='off')
          b-input-group-append
            b-button(variant="success" v-clipboard:copy="link") <v-icon name='clipboard'/> Copy 

      b-tab.pt-1(title='ics/ical' :active="type === 'ics'" @click='type="ics"')
        p(v-html='$t(`export_ical_explanation`)')
        b-input-group.mb-2(v-if='showLink')
          b-form-input( v-model='link' autocomplete='off')
          b-input-group-append
            b-button(variant="success" v-clipboard:copy="link") <v-icon name='clipboard'/> Copy 

      b-tab.pt-1(title='email' :active="type === 'email'" @click='type="email"')
        p(v-html='$t(`export_email_explanation`)')
        b-form
          el-switch(v-model='mail.sendOnInsert' :active-text="$t('notify_on_insert')")
          br
          el-switch(v-model='mail.reminder' :active-text="$t('send_reminder')") 
          b-form-input.mt-1(v-model='mail.mail' :placeholder="$t('Insert your address')")
          b-button.mt-1.float-right(variant='success' @click='activate_email') {{$t('Send')}}

      b-tab.pt-1(title='list' :active="type === 'list'" @click='type="list"')
        p(v-html='$t(`export_list_explanation`)')
        b-card.mb-1(no-body header='Eventi')
          b-list-group#list(flush)
            b-list-group-item.flex-column.align-items-start(v-for="event in filteredEvents" 
              :to='`/event/${event.id}`')
                //- b-media
                  img(v-if='event.image_path' slot="aside" :src="imgPath(event)" alt="Media Aside" style='max-height: 60px')
                small.float-right {{event.start_datetime|datetime}}
                strong.mb-1 {{event.title}}
                br
                small.float-right {{event.place.name}}
                b-badge.float-left.ml-1(:style='{backgroundColor: tag.color}' v-for='tag in event.tags') {{tag.tag}}
        b-form-textarea(v-model='script')

      b-tab.pt-1(title='calendar' :active="type === 'calendar'" @click='type="calendar"')
        p(v-html='$t(`export_calendar_explanation`)')
        Calendar
        b-form-textarea(v-model='script')

</template>
<script>
import { mapState } from 'vuex'
import config from '../../config'
import path from 'path'
import filters from '../filters'
import Calendar from '@/components/Calendar'
import {intersection} from 'lodash'

export default {
  name: 'Export',
  components: { Calendar },
  data () {
    return {
      type: 'feed',
      link: '',
      mail: {},
      export_list: true,
      script: `<iframe>Ti piacerebbe</iframe>`,
    }
  },
  filters,
  mounted () {
    this.link = this.loadLink()
  },
  watch: {
    type (value) {
      this.link = this.loadLink()
    }
  },
  methods: {
    activate_email () {
      this.$router.go(-1)
    },
    loadLink () {
      const tags = this.filters.tags.join(',')
      const places = this.filters.places.join(',')
      let query = ''
      if (tags || places) { 
        query = '?'
        if (tags) { 
          query += 'tags=' + tags
          if (places) { query += '&places=' + places }
        } else {
          query += 'places=' + places
        }
      }

      return `${config.apiurl}/export/${this.type}${query}`
    },
    imgPath (event) {
      return event.image_path && config.apiurl + '/../' + event.image_path
    },
  },
  computed: {
    ...mapState(['filters', 'user', 'logged', 'events']),
    filteredEvents () {
      return this.$store.getters.filteredEvents.filter(e => !e.past)
    },
    showLink () {
      return (['feed', 'ics'].indexOf(this.type)>-1)
    },
  }
}
</script>
<style>
#list {
  max-height: 400px;
  overflow-y: scroll;
}
</style>


