<template lang="pug">
v-container.container.pa-0.pa-md-3
  v-card
    v-alert(v-if='url!==settings.baseurl' outlined type='warning' show-icon :icon='mdiAlert')
      span(v-html="$t('admin.wrong_domain_warning', { url, baseurl: settings.baseurl })")
    v-alert(v-if='!selfReachable' outlined type='warning' show-icon :icon='mdiAlert')
      span(v-html="$t('admin.not_reachable')")      
    v-tabs(v-model='selectedTab' show-arrows :next-icon='mdiChevronRight' :prev-icon='mdiChevronLeft')

      //- SETTINGS
      v-tab(href='#settings') {{$t('common.settings')}}
      v-tab-item(value='settings')
        Settings

      //- EVENTS
      v-tab(href='#unconfirmed_events')
        v-badge(:value='!!unconfirmedEvents.length' :content='unconfirmedEvents.length') {{$t('common.events')}}
      v-tab-item(value='unconfirmed_events')
        Events(:unconfirmedEvents='unconfirmedEvents'
          @confirmed='id => { unconfirmedEvents = unconfirmedEvents.filter(e => e.id !== id)}')

      //- THEME
      v-tab(href='#theme') {{$t('common.theme')}}
      v-tab-item(value='theme')
        Theme

      //- USERS
      v-tab(href='#users')
        v-badge(:value='!!unconfirmedUsers.length' :content='unconfirmedUsers.length') {{$t('common.users')}}
      v-tab-item(value='users')
        Users(:users='users' @update='updateUsers')

      //- PLACES
      v-tab(href='#places') {{$t('common.places')}}
      v-tab-item(value='places')
        Places
      
      //- TAGS
      v-tab(href='#tags') {{$t('common.tags')}}
      v-tab-item(value='tags')
        Tags

      //- GEOCODING / MAPS
      v-tab(href='#geolocation' v-if='settings.allow_geolocation') {{$t('admin.geolocation')}}
      v-tab-item(value='geolocation')
        client-only(placeholder='Loading...')
          Geolocation

      //- Collections
      v-tab(href='#collections') {{$t('common.collections')}}
      v-tab-item(value='collections')
        Collections

      //- ANNOUNCEMENTS
      v-tab(href='#announcements') {{$t('common.announcements')}}
      v-tab-item(value='announcements')
        Announcement

      //- PLUGINS
      v-tab(href='#plugins') {{$t('common.plugins')}}
      v-tab-item(value='plugins')
        Plugin

      //- FEDERATION
      v-tab(href='#federation') {{$t('common.federation')}}
      v-tab-item(value='federation')
        Federation

      //- MODERATION
      v-tab(v-if='settings.enable_federation' href='#moderation') {{$t('common.moderation')}}
      v-tab-item(value='moderation')
        Moderation
</template>
<script>
import { mapState } from 'vuex'
import { mdiAlert, mdiChevronRight, mdiChevronLeft } from '@mdi/js'

export default {
  name: 'Admin',
  components: { 
    Settings: () => import(/* webpackChunkName: "admin" */'../components/admin/Settings.vue'),
    Users:  () => import(/* webpackChunkName: "admin" */'../components/admin/Users'),
    Events: () => import(/* webpackChunkName: "admin" */'../components/admin/Events'),
    Places: () => import(/* webpackChunkName: "admin" */'../components/admin/Places'),
    Tags: () => import(/* webpackChunkName: "admin" */'../components/admin/Tags'),
    Collections: () => import(/* webpackChunkName: "admin" */'../components/admin/Collections'),
    [process.client && 'Geolocation']: () => import(/* webpackChunkName: "admin" */'../components/admin/Geolocation.vue'),
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
      const selfReachable = await $axios.$get('/reachable')
      return { users, unconfirmedEvents, url, selfReachable }
    } catch (e) {
      return { users: [], unconfirmedEvents: [], url, selfReachable: false }
    }
  },
  data () {
    return {
      mdiAlert, mdiChevronRight, mdiChevronLeft,
      users: [],
      description: '',
      unconfirmedEvents: [],
      selfReachable: false
    }
  },
  head () {
    return { title: `${this.settings.title} - ${this.$t('common.admin')}` }
  },
  computed: {
    ...mapState(['settings']),
    unconfirmedUsers () {
      return this.users.filter(u => !u.is_active)
    },
    selectedTab: {
      set (tab) {
        this.$router.replace({ query: { ...this.$route.query, tab } })
      },
      get () {
        return this.$route.query.tab
      }
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
