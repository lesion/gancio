<template lang="pug">
  b-modal(hide-footer hide-header
    @hide='$router.replace("/")' size='lg' :visible='true' v-if='type')
    h3.text-center Export {{type}}
    b-input-group.mb-2(v-if='showLink')
      b-form-input( v-model='link' autocomplete='off')
      b-input-group-append
        b-button(variant="success" v-clipboard:copy="link") <v-icon name='clipboard'/> Copy 
    p {{$t('export_intro')}}
    p(v-html='$t(`export_${type}_explanation`)')
    li(v-if='filters.tags.length') {{$t('Tags')}} ->
      b-badge.ml-1(v-for='tag in filters.tags') {{tag}}
    li(v-if='filters.places.length') {{$t('Places')}}
      b-badge.ml-1(v-for='place in filters.places') {{place}}
    b-form(v-if="type==='email'")
      el-switch(v-model='mail.sendOnInsert' :active-text="$t('notify_on_insert')")
      br
      el-switch(v-model='mail.reminder' :active-text="$t('send_reminder')") 
      b-form-input.mt-1(v-model='mail.mail' :placeholder="$t('Insert your address')")
      b-button.mt-1.float-right(variant='success' @click='activate_email') {{$t('Send')}}

    div(v-if="type==='embed'"  style='max-width: 400px;')
      el-switch(v-model='export_list' :active-text="$t('export_list')")
      b-card(v-if='export_list' no-body header='Eventi')
        b-list-group(flush)
          b-list-group-item.flex-column.align-items-start(v-for="event in filteredEvents" 
            :href='`/event/${event.id}`')
              b-media
                img(v-if='event.image_path' slot="aside" :src="imgPath(event)" alt="Media Aside" style='max-height: 60px')
                small.float-right {{event.start_datetime|short_datetime}}
                h5.mb-1 {{event.title}}
                small.mb-1 {{event.description}}
              b-badge.float-right.ml-1(v-for='tag in event.tags') {{tag.tag}}
              small.float-right(v-b-popover.hover='event.place.address') {{event.place.name}}
      Calendar(v-else)
      br
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
      type: '',
      link: '',
      mail: {},
      export_list: true,
      script: `<iframe>Ti piacerebbe</iframe>`,
    }
  },
  filters,
  mounted () {
    this.type = this.$route.params.type
    this.link = this.loadLink()
    if (this.type === 'email' && this.logged) {
      this.mail.mail = this.user.email
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
      if (!this.filters.tags.length && !this.filters.places.length) return this.events
      return this.events.filter(e => {
        if (this.filters.tags.length) {
          const m = intersection(e.tags.map(t => t.tag), this.filters.tags)
          if (m.length>0) return true
        }
        if (this.filters.places.length) {
          if (this.filters.places.find(p => p === e.place.name))
            return true
        }
        return 0
      })
    },
    showLink () {
      return (['feed', 'ics'].indexOf(this.type)>-1)
    },
  }
}
</script>

