<template lang="pug">
  el-main
    h4 <nuxt-link to='/'><img src='/favicon.ico'/></nuxt-link> {{$t('common.admin')}}

    el-tabs(v-model='tab')

      //- USERS
      el-tab-pane.pt-1
        template(slot='label')
          v-icon(name='users')
          span.ml-1 {{$t('common.users')}}
          el-badge(v-show='unconfirmedUsers.length>0' :value='unconfirmedUsers.length')
        Users(:users='users')

      //- PLACES
      el-tab-pane.pt-1
        template(slot='label')
          v-icon(name='map-marker-alt')
          span.ml-1 {{$t('common.places')}}
        Places

      //- EVENTS
      el-tab-pane.pt-1
        template(slot='label')
          v-icon(name='calendar')
          span.ml-1 {{$t('common.events')}}
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
          el-pagination(:page-size='perPage' :currentPage.sync='eventPage' :total='events.length')

      //- SETTINGS
      el-tab-pane.pt-1
        template(slot='label')
          v-icon(name='cog')
          span  {{$t('common.settings')}}
        Settings

      //- FEDERATION
      el-tab-pane.pt-1
        template(slot='label')
          v-icon(name='network-wired')
          span.ml-1 {{$t('common.federation')}}
        Federation(:instances='instances')

</template>
<script>
import { mapState } from 'vuex'
import { Message } from 'element-ui'
import Users from '../components/admin/Users'
import Places from '../components/admin/Places'
import Settings from '../components/admin/Settings'
import Federation from '../components/admin/Federation'

export default {
  name: 'Admin',
  components: { Users, Places, Settings, Federation },
  middleware: ['auth'],
  data () {
    return {
      instances: [],
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
  async asyncData ({ $axios, params, store }) {
    try {
      const users = await $axios.$get('/users')
      const events = await $axios.$get('/event/unconfirmed')
      const instances = await $axios.$get('/instances')
      return { users, events, instances }
    } catch (e) {
      console.error(e)
    }
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
