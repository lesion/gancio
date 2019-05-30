<template lang="pug">
  el-dialog(:title='$t("common.export")' visible :before-close='close')
    p {{$t('export.intro')}}
    
    li(v-if='filters.tags.length') {{$t('common.tags')}}:
      el-tag.ml-1(size='mini' v-for='tag in filters.tags' :key='tag.tag') {{tag}}
    li(v-if='filters.places.length') {{$t('common.places')}}:
      el-tag.ml-1(size='mini' v-for='place in filters.places' :key='place.id') {{place}}
    el-tabs.mt-2(v-model='type')

      el-tab-pane.pt-1(label='email' name='email')
        p(v-html='$t(`export.email_description`)')
        el-form(@submit.native.prevent)
          //- el-switch(v-model='notification.notify_on_add' :active-text="$t('notify_on_insert')")
          //- br
          //- el-switch.mt-2(v-model='notification.send_notification' :active-text="$t('send_notification')") 
          el-input.mt-2(v-model='notification.email' :placeholder="$t('export.insert_your_address')" ref='email')
          el-button.mt-2.float-right(native-type= 'submit' type='success' @click='add_notification') {{$t('common.send')}}

      el-tab-pane.pt-1(label='feed rss' name='feed')
        span(v-html='$t(`export.feed_description`)')
        el-input(v-model='link')
          el-button(slot='append' plain type="primary" icon='el-icon-document' ) {{$t("common.copy")}}

      el-tab-pane.pt-1(label='ics/ical' name='ics')
        p(v-html='$t(`export.ical_description`)')
        el-input(v-model='link')
          el-button(slot='append' plain type="primary" icon='el-icon-document') {{$t("common.copy")}}

      el-tab-pane.pt-1(label='list' name='list')
        p(v-html='$t(`export.list_description`)')

        el-row
          el-col.mr-2(:span='11')
            el-input(v-model='list.title') Title
          el-col.float-right(:span='12')
            List(
              :title='list.title'
              :events='filteredEvents'
            )
        el-input.mb-1(type='textarea' v-model='listScript' readonly )
        el-button.float-right(plain type="primary" icon='el-icon-document') {{$t('common.copy')}}


      //- el-tab-pane.pt-1(label='calendar' name='calendar')
      //-   p(v-html='$t(`export.calendar_description`)')
      //-   //- no-ssr
      //-     Calendar.mb-1
      //-   el-input.mb-1(type='textarea' v-model='script')
      //-   el-button.float-right(plain type="primary" icon='el-icon-document') Copy

</template>
<script>
import { mapState, mapGetters } from 'vuex'
import path from 'path'
import Calendar from '@/components/Calendar'
import List from '@/components/List'
import {intersection} from 'lodash'
import { Message } from 'element-ui'
const { SHARED_CONF } = require('@/config')

export default {
  name: 'Export',
  components: { List },
  data () {
    return {
      type: 'email',
      notification: { email: '' },
      list: { title: SHARED_CONF.title },
    }
  },
  // filters,
  methods: {
    async add_notification () {
      if (!this.notification.email){
        Message({message:'Inserisci una mail', type: 'error'})
        return this.$refs.email.focus()
      }
      // await api.addNotification({ ...this.notification, filters: this.filters})
      // this.$refs.modal.hide()
      Message({message: this.$t('email_notification_activated'), type: 'success'})
    },
    imgPath (event) {
      return event.image_path && event.image_path
    },
    close (done) {
      this.$router.replace('/')
      done()
    }
  },
  computed: {
    ...mapState(['filters', 'events']),
    ...mapGetters(['filteredEvents']),
    listScript () {
      const params = []
      if (this.list.title) {
        params.push(`title=${this.list.title}`)
      }
      return `<iframe src="${SHARED_CONF.baseurl}/embed/list?${params.join('&')}"></iframe>`
    },
    link () {
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

      return `${SHARED_CONF.baseurl}/api/export/${this.type}${query}`
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


