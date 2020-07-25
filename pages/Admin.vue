<template lang="pug">
  v-container

    v-tabs

      //- SETTINGS
      v-tab {{$t('common.settings')}}
      v-tab-item
        Settings

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
        v-badge(:content='events.length') {{$t('common.events')}}
      v-tab-item
        p {{$t('admin.event_confirm_description')}}
        v-data-table(
          :items='events'
          :headers='eventHeaders'
        )
        //-   el-table-column(:label='$t("common.name")' width='300')
        //-     template(slot-scope='data') {{data.row.title}}
        //-   el-table-column(:label='$t("common.where")' width='250')
        //-     template(slot-scope='data') {{data.row.place.name}}
        //-   el-table-column(:label='$t("common.confirm")' width='250')
        //-     template(slot-scope='data')
        //-       el-button-group
        //-         el-button(type='primary' @click='confirm(data.row.id)' size='mini') {{$t('common.confirm')}}
        //-         el-button(type='success' @click='preview(data.row.id)' size='mini') {{$t('common.preview')}}
        //- client-only
        //-   el-pagination(v-if='events.length>perPage' :page-size='perPage' :currentPage.sync='eventPage' :total='events.length')

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
      description: '',
      events: []
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
