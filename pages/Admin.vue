<template lang="pug">
  el-main

    el-tabs(v-model='tab')

      //- SETTINGS
      el-tab-pane.pt-1
        template(slot='label')
          v-icon(name='cog')
          span.hidden-xs-only  {{$t('common.settings')}}
        Settings

      //- USERS
      el-tab-pane.pt-1
        template(slot='label')
          v-icon(name='users')
          span.hidden-xs-only.ml-1 {{$t('common.users')}}
          el-badge(v-show='unconfirmedUsers.length>0' :value='unconfirmedUsers.length')
        Users(:users='users')

      //- PLACES
      el-tab-pane.pt-1
        template(slot='label')
          v-icon(name='map-marker-alt')
          span.hidden-xs-only.ml-1 {{$t('common.places')}}
        Places

      //- EVENTS
      el-tab-pane.pt-1
        template(slot='label')
          v-icon(name='calendar')
          span.hidden-xs-only.ml-1 {{$t('common.events')}}
          el-badge(v-show='events.length>0' :value='events.length')
        p {{$t('admin.event_confirm_description')}}
        el-table(:data='paginatedEvents' small primary-key='id' v-loading='loading')
          el-table-column(:label='$t("common.name")' width='300')
            template(slot-scope='data') {{data.row.title}}
          el-table-column(:label='$t("common.where")' width='250')
            template(slot-scope='data') {{data.row.place.name}}
          el-table-column(:label='$t("common.confirm")' width='250')
            template(slot-scope='data')
              el-button(type='primary' @click='confirm(data.row.id)' size='mini') {{$t('common.confirm')}}
              el-button(type='success' @click='preview(data.row.id)' size='mini') {{$t('common.preview')}}
        client-only
          el-pagination(v-if='events.length>perPage' :page-size='perPage' :currentPage.sync='eventPage' :total='events.length')

      //- ANNOUNCEMENTS
      el-tab-pane.pt-1
        template(slot='label')
          v-icon(name='bullhorn')
          span.hidden-xs-only.ml-1 {{$t('common.announcements')}}
        Announcement

      //- FEDERATION
      el-tab-pane.pt-1
        template(slot='label')
          v-icon(name='network-wired')
          span.hidden-xs-only.ml-1 {{$t('common.federation')}}
        Federation

      //- MODERATION
      el-tab-pane.pt-1(v-if='settings.enable_federation')
        template(slot='label')
          v-icon(name='vector-square')
          span.hidden-xs-only.ml-1 {{$t('common.moderation')}}
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

export default {
  name: 'Admin',
  components: { Users, Places, Settings, Federation, Moderation, Announcement },
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
      perPage: 10,
      eventPage: 1,
      description: '',
      events: [],
      loading: false,
      tab: '0',
      open: true
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
    paginatedEvents () {
      return this.events.slice((this.eventPage - 1) * this.perPage,
        this.eventPage * this.perPage)
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
  }
}
</script>
