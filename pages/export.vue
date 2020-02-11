<template lang="pug">
  el-main
    p {{$t('export.intro')}}
    //- Search
    el-tabs.mt-2(v-model='type')

      //- TOFIX
      //- el-tab-pane.pt-1(label='email' name='email')
      //-   p(v-html='$t(`export.email_description`)')
      //-   el-form(@submit.native.prevent)
      //-     //- el-switch(v-model='notification.notify_on_add' :active-text="$t('notify_on_insert')")
      //-     //- br
      //-     //- el-switch.mt-2(v-model='notification.send_notification' :active-text="$t('send_notification')")
      //-     el-input.mt-2(v-model='notification.email' :placeholder="$t('export.insert_your_address')" ref='email')
      //-     el-button.mt-2.float-right(native-type= 'submit' type='success' @click='add_notification') {{$t('common.send')}}

      el-tab-pane.pt-1(label='Feed rss' name='rss')
        span(v-html='$t(`export.feed_description`)')
        el-input(v-model='link')
          el-button(slot='append' plain
          v-clipboard:copy='link' v-clipboard:success='copyLink'
          type="primary" icon='el-icon-document' ) {{$t("common.copy")}}

      el-tab-pane.pt-1(v-if='settings.enable_federation' :label="$t('common.fediverse')" name='fediverse')
        FollowMe

      el-tab-pane.pt-1(label='ics/ical' name='ics')
        p(v-html='$t(`export.ical_description`)')
        el-input(v-model='link')
          el-button(slot='append' v-clipboard:copy='link' v-clipboard:success='copyLink'
            plain type="primary" icon='el-icon-document') {{$t("common.copy")}}

      el-tab-pane.pt-1(label='list' name='list')
        p(v-html='$t(`export.list_description`)')

        el-row
          el-col.mr-2(:span='11')
            el-input(v-model='list.title') Title
          el-col.float-right(:span='12')
            List(
              :title='list.title'
              :events='filteredEvents')
        el-input.mb-1(type='textarea' v-model='listScript' readonly )
        el-button.float-right(plain v-clipboard:copy='listScript' v-clipboard:success='copyLink'
          type='primary' icon='el-icon-document') {{$t('common.copy')}}

      //- TOFIX
      //- el-tab-pane.pt-1(label='calendar' name='calendar')
      //-   p(v-html='$t(`export.calendar_description`)')
      //-   //- no-ssr
      //-     Calendar.mb-1
      //-   el-input.mb-1(type='textarea' v-model='script')
      //-   el-button.float-right(plain type="primary" icon='el-icon-document') Copy

</template>
<script>
import { mapState, mapGetters } from 'vuex'
import List from '@/components/List'
import FollowMe from '../components/FollowMe'
import { Message } from 'element-ui'

export default {
  name: 'Exports',
  components: { List, FollowMe },
  async asyncData ({ $axios, params, store }) {
    // get metadata just in case we are not coming from home
    if (store.state.tags.length) { return }
    const { tags, places } = await $axios.$get('/event/meta')
    store.commit('update', { tags, places })
  },
  data () {
    return {
      type: 'rss',
      notification: { email: '' },
      list: { title: 'Gancio' }
    }
  },
  computed: {
    ...mapState(['filters', 'events', 'settings']),
    ...mapGetters(['filteredEvents']),
    domain () {
      const URL = url.parse(this.settings.baseurl)
      return URL.hostname
    },
    listScript () {
      const params = []
      if (this.list.title) {
        params.push(`title=${this.list.title}`)
      }

      if (this.filters.places.length) {
        params.push(`places=${this.filters.places.map(p => p.id)}`)
      }

      if (this.filters.tags.length) {
        params.push(`tags=${this.filters.tags.map(t => t.id)}`)
      }

      return `<iframe style='border: 0px; width: 100%;' src="${this.settings.baseurl}/embed/list?${params.join('&')}"></iframe>`
    },
    link () {
      const tags = this.filters.tags.map(t => t.id).join(',')
      const places = this.filters.places.map(p => p.id).join(',')
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

      return `${this.settings.baseurl}/feed/${this.type}${query}`
    },
    showLink () {
      return (['rss', 'ics'].includes(this.type))
    }
  },
  methods: {
    copyLink () {
      Message({ message: this.$t('common.copied'), type: 'success' })
    },
    add_notification () {
      if (!this.notification.email) {
        Message({ message: 'Inserisci una mail', showClose: true, type: 'error' })
        // return this.$refs.email.focus()
      }
      // await api.addNotification({ ...this.notification, filters: this.filters})
      // this.$refs.modal.hide()
      Message({ message: this.$t('email_notification_activated'), showClose: true, type: 'success' })
    },
    imgPath (event) {
      return event.image_path && event.image_path
    }
  },
  head () {
    return {
      title: `${this.settings.title} - ${this.$t('common.export')}`
    }
  }
}
</script>
<style>
#list {
  max-height: 400px;
  overflow-y: auto;
}
</style>
