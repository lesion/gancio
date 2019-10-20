<template lang="pug">
  el-main
    nuxt-link.float-right(to='/')
      el-button(circle  icon='el-icon-close' type='danger' size='small' plain)

    h5 {{$t('common.admin')}}

    el-tabs(v-model='tab')

      //- USERS
      el-tab-pane.pt-1
        template(slot='label')
          v-icon(name='users')
          span.ml-1 {{$t('common.users')}}
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
        Federation

</template>
<script>
import { mapState, mapActions } from 'vuex'
import { Message, MessageBox } from 'element-ui'
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
      return { users, events, mastodon_instance: store.state.settings.mastodon_instance }
    } catch (e) {
      console.error(e)
    }
  },
  computed: {
    ...mapState(['settings']),
    paginatedEvents () {
      return this.events.slice((this.eventPage - 1) * this.perPage,
        this.eventPage * this.perPage)
    },
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
