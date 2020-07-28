<template lang="pug">
  v-container

    v-tabs

      //- SETTINGS
      v-tab {{$t('common.settings')}}
      v-tab-item
        Settings

      //- THEME
      v-tab {{$t('common.theme')}}
      v-tab-item
        Theme

      //- USERS
      v-tab
        v-badge(:value='unconfirmedUsers.length' :content='unconfirmedUsers.length') {{$t('common.users')}}
      v-tab-item
        Users(:users='users')

      //- PLACES
      v-tab {{$t('common.places')}}
      v-tab-item
        Places

      //- EVENTS
      v-tab
        v-badge(:value='events.length') {{$t('common.events')}}
      v-tab-item
        v-container
          v-subheader {{$t('admin.event_confirm_description')}}
          v-data-table(
            :items='events'
            :headers='eventHeaders')

      //- ANNOUNCEMENTS
      v-tab {{$t('common.announcements')}}
      v-tab-item
        Announcement

      //- FEDERATION
      v-tab {{$t('common.federation')}}
      v-tab-item
        Federation

      //- MODERATION
      v-tab(v-if='settings.enable_federation') {{$t('common.moderation')}}
      v-tab-item
        Moderation

</template>
<script>
import { mapState } from 'vuex'
import { Message } from 'element-ui'
import Users from '../components/admin/Users'
import Places from '../components/admin/Places'
import Settings from '../components/admin/Settings'
import Federation from '../components/admin/Federation'
import Moderation from '../components/admin/Moderation'
import Announcement from '../components/admin/Announcement'
import Theme from '../components/admin/Theme'

export default {
  name: 'Admin',
  components: { Users, Places, Settings, Federation, Moderation, Announcement, Theme },
  middleware: ['auth'],
  async asyncData ({ $axios, params, store }) {
    try {
      const users = await $axios.$get('/users')
      const events = await $axios.$get('/event/unconfirmed')
      return { users, events }
    } catch (e) {
      console.error(e)
      return { users: [], events: [] }
    }
  },
  data () {
    return {
      description: '',
      events: [],
      eventHeaders: [
        { value: 'title', text: 'Title' }
      ]
    }
  },
  computed: {
    ...mapState(['settings']),
    unconfirmedUsers () {
      return this.users.filter(u => !u.is_active)
    }
  },
  methods: {
    preview (id) {
      this.$router.push(`/event/${id}`)
    },
    async confirm (id) {
      try {
        this.loading = true
        await this.$axios.$get(`/event/confirm/${id}`)
        this.loading = false
        Message({
          message: this.$t('event.confirmed'),
          showClose: true,
          type: 'success'
        })
        this.events = this.events.filter(e => e.id !== id)
      } catch (e) {
      }
    }
  },
  head () {
    return { title: `${this.settings.title} - ${this.$t('common.admin')}` }
  }
}
</script>
