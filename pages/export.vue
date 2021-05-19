<template lang="pug">
  v-container
    v-card(outlined)
      v-card-text
        p.text-body-1 {{$t('export.intro')}}
        v-row
          v-col(:md='2' :cols='12')
            v-card-title.py-0 {{$t('common.filter')}}
          v-col
            Search(
              :filters='filters'
              @update='updateFilters')
      v-tabs(v-model='type')

        //- TOFIX
        //- v-tab {{$t('common.email')}}
        //- v-tab-item
          v-card
            v-card-text
              p(v-html='$t(`export.email_description`)')
              v-switch.mt-0(inset :label="$t('notify_on_insert')")
              v-switch.mt-0(inset :label="$t('morning_notification')")
              v-text-field(v-model='notification.email' :placeholder="$t('export.insert_your_address')" ref='email')
                v-btn(slot='prepend' text color='primary' @click='add_notification') {{$t('common.send')}} <v-icon>mdi-email</v-icon>

        v-tab {{$t('common.feed')}}
        v-tab-item
          v-card
            v-card-text
              p(v-html='$t(`export.feed_description`)')
              v-text-field(v-model='link' readonly)
                v-btn(slot='prepend' text color='primary'
                  v-clipboard:copy='link'
                  v-clipboard:success='copyLink.bind(this, "feed")') {{$t("common.copy")}}
                  v-icon.ml-1 mdi-content-copy

        v-tab ics/ical
        v-tab-item
          v-card
            v-card-text
              p(v-html='$t(`export.ical_description`)')
              v-text-field(v-model='link')
                v-btn(slot='prepend' text color='primary'
                  v-clipboard:copy='link' v-clipboard:success='copyLink.bind(this, "ical")') {{$t("common.copy")}}
                  v-icon.ml-1 mdi-content-copy

        v-tab List
        v-tab-item
          v-card
            v-card-text
              p(v-html='$t(`export.list_description`)')

              v-row
                v-col.mr-2(:span='11')
                  v-text-field(v-model='list.title' :label='$t("common.title")')
                  v-text-field(v-model='list.maxEvents' type='number' :label='$t("common.max_events")')
                v-col.float-right(:span='12')
                  List(
                    :title='list.title'
                    :maxEvents='list.maxEvents'
                    :events='events')
              v-text-field.mb-1(type='textarea' v-model='listScript' readonly )
                v-btn(slot='prepend' text
                  color='primary' v-clipboard:copy='listScript' v-clipboard:success='copyLink.bind(this,"list")') {{$t('common.copy')}}
                    v-icon.ml-1 mdi-content-copy

        v-tab(v-if='settings.enable_federation') {{$t('common.fediverse')}}
        v-tab-item(v-if='settings.enable_federation')
          FollowMe
          //- TOFIX
          //- v-tab.pt-1(label='calendar' name='calendar')
          //- v-tab-item
          //-   p(v-html='$t(`export.calendar_description`)')
          //-   //- no-ssr
          //-     Calendar.mb-1
          //-   v-text-field.mb-1(type='textarea' v-model='script')
          //-   el-button.float-right(plain type="primary" icon='el-icon-document') Copy

</template>
<script>
import dayjs from 'dayjs'
import { mapState } from 'vuex'
import List from '@/components/List'
import FollowMe from '../components/FollowMe'
import Search from '@/components/Search'

export default {
  name: 'Exports',
  components: { List, FollowMe, Search },
  async asyncData ({ $axios, params, store, $api }) {
    const events = await $api.getEvents({
      start: dayjs().unix(),
      show_recurrent: false
    })
    return { events }
  },
  data () {
    return {
      type: 'rss',
      notification: { email: '' },
      list: { title: 'Gancio', maxEvents: 3 },
      filters: { tags: [], places: [], show_recurrent: false },
      events: []
    }
  },
  head () {
    return {
      title: `${this.settings.title} - ${this.$t('common.export')}`
    }
  },
  computed: {
    ...mapState(['settings']),
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
        params.push(`tags=${this.filters.tags.join(',')}`)
      }

      if (this.filters.show_recurrent) {
        params.push('show_recurrent=true')
      }
      return `<iframe style='border: 0px; width: 100%;' src="${this.settings.baseurl}/embed/list?${params.join('&')}"></iframe>`
    },
    link () {
      const typeMap = ['rss', 'ics', 'list']
      const params = []

      if (this.filters.tags.length) {
        params.push(`tags=${this.filters.tags.join(',')}`)
      }

      if (this.filters.places.length) {
        params.push(`places=${this.filters.places.join(',')}`)
      }

      if (this.filters.show_recurrent) {
        params.push('show_recurrent=true')
      }

      return `${this.settings.baseurl}/feed/${typeMap[this.type]}?${params.join('&')}`
    },
    showLink () {
      return (['rss', 'ics'].includes(this.type))
    }
  },
  methods: {
    async updateFilters (filters) {
      this.filters = filters
      this.events = await this.$api.getEvents({
        start: dayjs().unix(),
        places: this.filters.places,
        tags: this.filters.tags,
        show_recurrent: !!this.filters.show_recurrent
      })
    },
    copyLink (type) {
      if (type === 'feed') {
        this.$root.$message('common.feed_url_copied')
      } else {
        this.$root.$message('common.copied')
      }
    },
    async add_notification () {
      // validate()
      // if (!this.notification.email) {
      // Message({ message: 'Inserisci una mail', showClose: true, type: 'error' })
      // return this.$refs.email.focus()
      // }
      // await api.addNotification({ ...this.notification, filters: this.filters})
      // this.$refs.modal.hide()
      // Message({ message: this.$t('email_notification_activated'), showClose: true, type: 'success' })
    },
    imgPath (event) {
      return event.image_path && event.image_path
    }
  }
}
</script>
