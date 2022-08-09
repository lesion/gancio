<template lang="pug">
v-container.container.pa-0.pa-md-3
  v-card
    v-alert(v-if='url!==settings.baseurl' outlined type='warning' color='red' show-icon :icon='mdiAlert')
      span(v-html="$t('admin.wrong_domain_warning', { url, baseurl: settings.baseurl })")
    v-tabs(v-model='selectedTab' show-arrows :next-icon='mdiChevronRight' :prev-icon='mdiChevronLeft')

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
        Users(:users='users' @update='updateUsers')

      //- PLACES
      v-tab {{$t('common.places')}}
      v-tab-item
        Places

      //- Collections
      v-tab {{$t('common.collections')}}
      v-tab-item
        Collections

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

      //- PLUGINS
      v-tab {{$t('common.plugins')}}
      v-tab-item
        Plugin

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
import { mdiAlert, mdiChevronRight, mdiChevronLeft } from '@mdi/js'
import Settings from '@/components/admin/Settings'

export default {
  name: 'Admin',
  components: { 
    Settings,
    Users:  () => import(/* webpackChunkName: "admin" */'../components/admin/Users'),
    Events: () => import(/* webpackChunkName: "admin" */'../components/admin/Events'),
    Places: () => import(/* webpackChunkName: "admin" */'../components/admin/Places'),
    Collections: () => import(/* webpackChunkName: "admin" */'../components/admin/Collections'),
    Federation: () => import(/* webpackChunkName: "admin" */'../components/admin/Federation.vue'),
    Moderation: () => import(/* webpackChunkName: "admin" */'../components/admin/Moderation.vue'),
    Plugin: () => import(/* webpackChunkName: "admin" */'../components/admin/Plugin.vue'),
    Announcement: () => import(/* webpackChunkName: "admin" */'../components/admin/Announcement.vue'),
    Theme: () => import(/* webpackChunkName: "admin" */'../components/admin/Theme.vue')
  },
  middleware: ['auth'],
  async asyncData ({ $axios, req }) {
    let url
    if (process.client) {
      url = window.location.protocol + '//' + window.location.host
    } else {
      url = req.protocol + '://' + req.headers.host
    }
    try {
      const users = await $axios.$get('/users')
      const unconfirmedEvents = await $axios.$get('/event/unconfirmed')
      return { users, unconfirmedEvents, selectedTab: 0, url }
    } catch (e) {
      return { users: [], unconfirmedEvents: [], selectedTab: 0, url }
    }
  },
  data () {
    return {
      mdiAlert, mdiChevronRight, mdiChevronLeft,
      users: [],
      description: '',
      unconfirmedEvents: [],
      selectedTab: 0
    }
  },
  head () {
    return { title: `${this.settings.title} - ${this.$t('common.admin')}` }
  },
  computed: {
    ...mapState(['settings']),
    unconfirmedUsers () {
      return this.users.filter(u => !u.is_active)
    }
  },
  methods: {
    async updateUsers () {
      this.users = await this.$axios.$get('/users')
    },
    preview (id) {
      this.$router.push(`/event/${id}`)
    },
    async confirm (id) {
      this.loading = true
      await this.$axios.$get(`/event/confirm/${id}`)
      this.loading = false
      this.$root.$message('event.confirmed', { color: 'success' })
      this.unconfirmedEvents = this.unconfirmedEvents.filter(e => e.id !== id)
    }
  }
}
</script>
