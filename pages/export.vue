<template lang="pug">
  v-container
    v-card(outlined)
      v-card-title {{$t('common.share')}}
      v-card-text
        p.text-body-1 {{$t('export.intro')}}
        v-row
          v-col(:md='2' :cols='12')
            v-card-title.py-0 {{$t('common.filter')}}
          v-col
            Search(
              :filters='filters'
              @update='f => filters = f')
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
                v-btn(slot='prepend' text color='primary' @click='clipboard(link)') {{$t("common.copy")}}
                  v-icon.ml-1 mdi-content-copy

        v-tab ics/ical
        v-tab-item
          v-card
            v-card-text
              p(v-html='$t(`export.ical_description`)')
              v-text-field(v-model='link')
                v-btn(slot='prepend' text color='primary' @click='clipboard(link)') {{$t("common.copy")}}
                  v-icon.ml-1 mdi-content-copy

        v-tab List
        v-tab-item
          v-card
            v-card-text
              p(v-html='$t(`export.list_description`)')

              v-row
                v-col.mr-2(:span='11')
                  v-text-field(v-model='list.title' :label='$t("common.title")')
                  v-text-field(v-model='list.maxEvents' type='number' min='1' :label='$t("common.max_events")')
                  v-switch(v-model='list.theme' inset true-value='dark' false-value='light' :label="$t('admin.is_dark')")
                v-col.float-right(:span='12')
                  gancio-events(:baseurl='settings.baseurl'
                    :maxlength='list.maxEvents &&  Number(list.maxEvents)'
                    :title='list.title'
                    :theme='list.theme'
                    :places='filters.places.join(",")'
                    :tags='filters.tags.join(",")')
              v-alert.pa-5.my-4.blue-grey.darken-4.text-body-1.lime--text.text--lighten-3 <pre>{{code}}</pre>
                v-btn.float-end(text color='primary' @click='clipboard(code)') {{$t("common.copy")}}
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
import clipboard from '../assets/clipboard'

export default {
  name: 'Exports',
  components: { List, FollowMe, Search },
  mixins: [clipboard],
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
      list: { title: 'Gancio', maxEvents: null, theme: 'dark' },
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
    code () {
      const params = [`baseurl="${this.settings.baseurl}"`]

      if (this.list.title) {
        params.push(`title="${this.list.title}"`)
      }

      if (this.filters.places.length) {
        params.push(`places="${this.filters.places.join(',')}"`)
      }

      if (this.filters.tags.length) {
        params.push(`tags="${this.filters.tags.join(',')}"`)
      }

      if (this.filters.show_recurrent) {
        params.push('show_recurrent')
      }

      if (this.list.maxEvents) {
        params.push('maxlength=' + this.list.maxEvents)
      }

      params.push(`theme="${this.list.theme}"`)

      return `<script src="${this.settings.baseurl}\/gancio-events.es.js"><\/script>\n<gancio-events ${params.join(' ')}></gancio-events>\n\n`

      
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
      return event.media && event.media[0].url
    }
  }
}
</script>
