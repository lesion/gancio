<template lang="pug">
  b-modal(ref='modal' @hidden='$router.replace("/")' 
    :title='$t("common.export")' :visible='true' size='lg' hide-footer)
    p {{$t('export.intro')}}
    
    li(v-if='filters.tags.length') {{$t('common.tags')}}:
      el-tag.ml-1(color='#409EFF' size='mini' v-for='tag in filters.tags' :key='tag.tag') {{tag}}
    li(v-if='filters.places.length') {{$t('common.places')}}:
      el-tag.ml-1(color='#409EFF' size='mini' v-for='place in filters.places' :key='place.id') {{place}}
    el-tabs.mt-2(tabPosition='left' v-model='type')

      el-tab-pane.pt-1(label='email' name='email')
        p(v-html='$t(`export.email_description`)')
        el-form(@submit.native.prevent)
          //- el-switch(v-model='notification.notify_on_add' :active-text="$t('notify_on_insert')")
          //- br
          //- el-switch.mt-2(v-model='notification.send_notification' :active-text="$t('send_notification')") 
          el-input.mt-2(v-model='notification.email' :placeholder="$t('common.insert_your_address')" ref='email')
          el-button.mt-2.float-right(native-type= 'submit' type='success' @click='add_notification') {{$t('Send')}}

      el-tab-pane.pt-1(label='feed rss' name='feed')
        span(v-html='$t(`export.feed_description`)')
        el-input(v-model='link')
          el-button(slot='append' plain type="primary" icon='el-icon-document' v-clipboard:copy="link") {{$t("common.copy")}}

      el-tab-pane.pt-1(label='ics/ical' name='ics')
        p(v-html='$t(`export.ical_description`)')
        el-input(v-model='link')
          el-button(slot='append' plain type="primary" icon='el-icon-document' v-clipboard:copy="link") {{$t("common.opy")}}

      el-tab-pane.pt-1(label='list' name='list')
        p(v-html='$t(`export.list_description`)')
        //- el-form-item(:label="$t('export.show_tags')")
        el-switch(v-model='list.show_tags')
        
        iframe(:src='`http://localhost:3000/embed/list?tags=cia&showtags=${list.show_tags?"true":""}`' height='300')
        //- el-card.mb-1(no-body header='Eventi')
        //-   b-list-group#list(flush)
        //-     b-list-group-item.flex-column.align-items-start(v-for="event in filteredEvents" :key='event.id'
        //-       :to='`/event/${event.id}`')
        //-         //- b-media
        //-           img(v-if='event.image_path' slot="aside" :src="imgPath(event)" alt="Meia Aside" style='max-height: 60px')
        //-         small.float-right {{event.start_datetime|datetime}}
        //-         strong.mb-1 {{event.title}}
        //-         br
        //-         small.float-right {{event.place.name}}
        //-         el-tag.mr-1(:color='tag.color || "grey"' size='mini' v-for='tag in event.tags' :key='tag.tag') {{tag.tag}}
        el-input.mb-1(type='textarea' v-model='script')
        el-button.float-right(plain type="primary" icon='el-icon-document' v-clipboard:copy="script") Copy


      el-tab-pane.pt-1(label='calendar' name='calendar')
        p(v-html='$t(`export.calendar_description`)')
        //- no-ssr
          Calendar.mb-1
        el-input.mb-1(type='textarea' v-model='script')
        el-button.float-right(plain type="primary" icon='el-icon-document' v-clipboard:copy="script") Copy

</template>
<script>
import { mapState } from 'vuex'
import path from 'path'
// import filters from '../filters'
import Calendar from '@/components/Calendar'
import List from '@/components/List'
import {intersection} from 'lodash'
// import api from '@/api'
import { Message } from 'element-ui'

export default {
  name: 'Export',
  components: { List },
  data () {
    return {
      type: 'email',
      link: '',
      export_list: true,
      script: `<iframe>Ti piacerebbe</iframe>`,
      notification: { email: '' },
      list: { show_tags: true },
    }
  },
  // filters,
  mounted () {
    this.link = this.loadLink()
  },
  watch: {
    type (value) {
      this.link = this.loadLink()
    }
  },
  methods: {
    async add_notification () {
      if (!this.notification.email){
        Message({message:'Inserisci una mail', type: 'error'})
        return this.$refs.email.focus()
      }
      await api.addNotification({ ...this.notification, filters: this.filters})
      this.$refs.modal.hide()
      Message({message: this.$t('email_notification_activated'), type: 'success'})
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
    ...mapState(['filters', 'events']),
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


