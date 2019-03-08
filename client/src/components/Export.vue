<template lang="pug">
  b-modal(ref='modal' @hidden='$router.replace("/")' 
    :title='$t("Export")' :visible='true' size='lg' hide-footer)
    p {{$t('export_intro')}}
    
    li(v-if='filters.tags.length') {{$t('Tags')}}:
      el-tag.ml-1(color='#409EFF' size='mini' v-for='tag in filters.tags' :key='tag.tag') {{tag}}
    li(v-if='filters.places.length') {{$t('Places')}}:
      el-tag.ml-1(color='#409EFF' size='mini' v-for='place in filters.places' :key='place.id') {{place}}
    el-tabs.mt-2(tabPosition='left' v-model='type')

      el-tab-pane.pt-1(label='email' name='email')
        p(v-html='$t(`export_email_explanation`)')
        b-form
          el-switch(v-model='reminder.send_on_insert' :active-text="$t('notify_on_insert')")
          br
          el-switch.mt-2(v-model='reminder.send_reminder' :active-text="$t('send_reminder')") 
          el-input.mt-2(v-model='reminder.mail' :placeholder="$t('Insert your address')")
          el-button.mt-2.float-right(type='success' @click='activate_email') {{$t('Send')}}

      el-tab-pane.pt-1(label='feed rss' name='feed')
        span(v-html='$t(`export_feed_explanation`)')
        el-input(v-model='link')
          el-button(slot='append' plain type="primary" icon='el-icon-document' v-clipboard:copy="link") {{$t("Copy")}}

      el-tab-pane.pt-1(label='ics/ical' name='ics')
        p(v-html='$t(`export_ical_explanation`)')
        el-input(v-model='link')
          el-button(slot='append' plain type="primary" icon='el-icon-document' v-clipboard:copy="link") {{$t("Copy")}}

      el-tab-pane.pt-1(label='list' name='list')
        p(v-html='$t(`export_list_explanation`)')
        b-card.mb-1(no-body header='Eventi')
          b-list-group#list(flush)
            b-list-group-item.flex-column.align-items-start(v-for="event in filteredEvents" :key='event.id'
              :to='`/event/${event.id}`')
                //- b-media
                  img(v-if='event.image_path' slot="aside" :src="imgPath(event)" alt="Meia Aside" style='max-height: 60px')
                small.float-right {{event.start_datetime|datetime}}
                strong.mb-1 {{event.title}}
                br
                small.float-right {{event.place.name}}
                el-tag.mr-1(:color='tag.color' size='mini' v-for='tag in event.tags' :key='tag.tag') {{tag.tag}}
        el-input.mb-1(type='textarea' v-model='script')
        el-button.float-right(plain type="primary" icon='el-icon-document' v-clipboard:copy="script") Copy


      el-tab-pane.pt-1(label='calendar' name='calendar')
        p(v-html='$t(`export_calendar_explanation`)')
        Calendar.mb-1
        el-input.mb-1(type='textarea' v-model='script')
        el-button.float-right(plain type="primary" icon='el-icon-document' v-clipboard:copy="script") Copy

</template>
<script>
import { mapState } from 'vuex'
import path from 'path'
import filters from '../filters'
import Calendar from '@/components/Calendar'
import {intersection} from 'lodash'

export default {
  name: 'Export',
  components: { Calendar },
  data () {
    return {
      type: 'email',
      link: '',
      reminder: { send_on_insert: true, send_reminder: false },
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
      this.$refs.modal.hide()
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

      return `${process.env.VUE_APP_API}/api/export/${this.type}${query}`
    },
    imgPath (event) {
      return event.image_path && event.image_path
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


