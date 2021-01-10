<template lang="pug">
  v-container
    v-card
      v-tabs(v-model='selectedTab')

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
          v-badge(:value='!!unconfirmedUsers.length' :content='unconfirmedUsers.length') {{$t('common.users')}}
        v-tab-item
          Users(:users='users')

        //- PLACES
        v-tab {{$t('common.places')}}
        v-tab-item
          Places

        //- EVENTS
        v-tab
          v-badge(:value='!!unconfirmedEvents.length' :content='unconfirmedEvents.length') {{$t('common.events')}}
        v-tab-item
          Events(:unconfirmedEvents='unconfirmedEvents'
            @confirmed='id => { unconfirmedEvents = unconfirmedEvents.filter(e => e.id !== id)}')

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
import Users from '../components/admin/Users'
import Events from '../components/admin/Events'
import Places from '../components/admin/Places'
import Settings from '../components/admin/Settings'
import Federation from '../components/admin/Federation'
import Moderation from '../components/admin/Moderation'
import Announcement from '../components/admin/Announcement'
import Theme from '../components/admin/Theme'

export default {
  name: 'Admin',
  components: { Users, Events, Places, Settings, Federation, Moderation, Announcement, Theme },
  middleware: ['auth'],
  async asyncData ({ $axios, params, store }) {
    try {
      const users = await $axios.$get('/users')
      const unconfirmedEvents = await $axios.$get('/event/unconfirmed')
      return { users, unconfirmedEvents }
    } catch (e) {
      console.error(e)
      return { users: [], unconfirmedEvents: [] }
    }
  },
  data () {
    return {
      description: '',
      unconfirmedEvents: []
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
      this.loading = true
      await this.$axios.$get(`/event/confirm/${id}`)
      this.loading = false
      this.$root.$message('event.confirmed', { color: 'succes' })
      this.unconfirmedEvents = this.unconfirmedEvents.filter(e => e.id !== id)
    }
  },
  head () {
    return { title: `${this.settings.title} - ${this.$t('common.admin')}` }
  }
}
</script>
