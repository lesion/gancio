<template lang="pug">
  b-modal(hide-footer @hidden='$router.replace("/")' :title='$t("common.admin")' 
    :visible='true' size='lg')
    el-tabs(tabPosition='left' v-model='tab')

      //- USERS
      el-tab-pane.pt-1
        template(slot='label')
          v-icon(name='users')
          span.ml-1 {{$t('common.users')}}
        el-table(:data='paginatedUsers' small)
          el-table-column(label='Email')
            template(slot-scope='data')
              el-popover(trigger='hover' :content='data.row.description' width='400')
                span(slot='reference') {{data.row.email}}
          el-table-column(:label="$t('common.actions')")
            template(slot-scope='data')
              el-button.mr-1(size='mini'
                :type='data.row.is_active?"warning":"success"'
                @click='toggle(data.row)') {{data.row.is_active?$t('common.deactivate'):$t('common.activate')}}
              el-button(size='mini'
                :type='data.row.is_admin?"danger":"warning"'
                @click='toggleAdmin(data.row)') {{data.row.is_admin?$t('common.remove_admin'):$t('common.admin')}}
        el-pagination(:page-size='perPage' :currentPage.sync='userPage' :total='users.length')

      //- PLACES
      el-tab-pane.pt-1
        template(slot='label')
          v-icon(name='map-marker-alt')
          span.ml-1 {{$t('common.places')}}
        p {{$t('admin.place_description')}}
        el-form.mb-2(:inline='true' label-width='120px')
          el-form-item(:label="$t('common.name')")
            el-input.mr-1(:placeholder='$t("common.name")' v-model='place.name')
          el-form-item(:label="$t('common.address')")
            el-input.mr-1(:placeholder='$t("common.address")' v-model='place.address')
          el-button(variant='primary' @click='savePlace') {{$t('common.save')}}
        el-table(:data='paginatedPlaces' small)
          el-table-column(:label="$t('common.name')")
            template(slot-scope='data') {{data.row.name}}
          el-table-column(:label="$t('common.address')")
            template(slot-scope='data') {{data.row.address}}
        el-pagination(:page-size='perPage' :currentPage.sync='placePage' :total='places.length')

      //- EVENTS
      el-tab-pane.pt-1
        template(slot='label')
          v-icon(name='calendar')
          span.ml-1 {{$t('common.events')}}
        p {{$t('admin.event_confirm_description')}}
        el-table(:data='paginatedEvents' small primary-key='id' v-loading='loading')
          el-table-column(:label='$t("common.name")')
            template(slot-scope='data') {{data.row.title}}
          el-table-column(:label='$t("common.where")')
            template(slot-scope='data') {{data.row.place.name}}
          el-table-column(:label='$t("common.confirm")')
            template(slot-scope='data')
              el-button(type='primary' @click='confirm(data.row.id)' size='mini') {{$t('common.confirm')}}
              el-button(type='success' @click='preview(data.row.id)' size='mini') {{$t('common.preview')}}

        el-pagination(:page-size='perPage' :currentPage.sync='eventPage' :total='events.length')

      //- TAGS
      el-tab-pane.pt-1
        template(slot='label')
          v-icon(name='tag')
          span  {{$t('common.tags')}}
        p {{$t('admin.tag_description')}}
          el-tag(v-if='tag.tag' :color='tag.color' size='mini') {{tag.tag}}
        el-form(:inline='true' label-width='120px')
          el-form-item(:label="$t('common.color')")
            el-color-picker(v-model='tag.color' @change='updateColor')
        el-table(:data='paginatedTags' striped small hover
          highlight-current-row @current-change="tagSelected")
          el-table-column(:label="$t('common.tag')")
            template(slot-scope='data')
              el-tag(:color='data.row.color' size='mini') {{data.row.tag}}
        el-pagination(:page-size='perPage' :currentPage.sync='tagPage' :total='tags.length')

      //- SETTINGS
      el-tab-pane.pt-1
        template(slot='label')
          v-icon(name='tools')
          span  {{$t('common.settings')}}
        el-form(inline @submit.prevent.stop='associatemastodon_instance')
          span {{$t('admin.mastodon_description')}}
          el-input(v-model="mastodon_instance")
            span(slot='prepend') {{$t('admin.mastodon_instance')}}
            el-button(slot='append' @click='associate' :disabled='!mastodon_instance.length') {{$t('common.associate')}}

</template>
<script>
import { mapState } from 'vuex'
import api from '@/plugins/api'
import { Message } from 'element-ui'

export default {
  name: 'Admin',
  middleware: ['auth'],
  data () {
    return {
      perPage: 10,
      users: [],
      userFields: ['email', 'action'],
      placeFields: ['name', 'address'],
      placePage: 1,
      userPage: 1,
      eventPage: 1,
      tagPage: 1,
      tagFields: ['tag', 'color'],
      description: '',
      place: {name: '', address: '' },
      tag: {name: '', color: ''},
      events: [],
      loading: false,
      mastodon_instance: '',
      settings: {},
      tab: "0",
    }
  },
  async mounted () {
    console.log('sono dentro mounted', this.$route)
    const code = this.$route.query.code

    if (code) {
      this.tab = "4"
      const instance = await this.$axios.$post('/user/code', {code, is_admin: true})
    }
  //   // this.users = await api.getUsers()
  //   // this.events = await api.getUnconfirmedEvents()
  //   // this.settings = await api.getAdminSettings()
  },
  async asyncData ({ $axios, params, store }) {
    console.log(store.state)
    try {
      const users = await $axios.$get('/users')
      const events = await $axios.$get('/event/unconfirmed')
      const settings = await $axios.$get('/settings')
      return { users, events, settings, mastodon_instance: settings.mastodon_auth && settings.mastodon_auth.instance}
    } catch ( e ) {
      console.error(e)
    }
  },
  computed: {
    ...mapState(['tags', 'places']),
    paginatedEvents () {
      return this.events.slice((this.eventPage-1) * this.perPage,
        this.eventPage * this.perPage)
    },
    paginatedTags () {
      return this.tags.slice((this.tagPage-1) * this.perPage,
        this.tagPage * this.perPage)
    },
    paginatedUsers () {
      return this.users.slice((this.userPage-1) * this.perPage,
        this.userPage * this.perPage)
    },
    paginatedPlaces () {
      return this.places.slice((this.placePage-1) * this.perPage,
        this.placePage * this.perPage)
    },    
  },
  methods: {
    placeSelected (items) {
      if (items.length === 0 ) {
        this.place.name = this.place.address = ''
        return
      }
      const item = items[0]
      this.place.name = item.name
      this.place.address = item.address
      this.place.id = item.id
    },
    tagSelected (tag) {
      this.tag = { color: tag.color, tag: tag.tag }
    },
    async savePlace () {
      const place = await api.updatePlace(this.place)
    },
    async toggle(user) {
      user.is_active = !user.is_active
      const newuser = await api.updateUser(user)
    },
    async toggleAdmin(user) {
      user.is_admin = !user.is_admin
      const newuser = await api.updateUser(user)
    },
    async updateColor () {
      // try {
      //   const newTag = await this.$axios.$put('/tag', this.tag)
      // } catch (e) {
      //   console.log(e)
      // }
    },
    preview (id) {
      this.$router.push(`/event/${id}`)
    },
    async associate () {
      if (!this.mastodon_instance) return

      const url = await this.$axios.$post('/user/getauthurl', {instance: this.mastodon_instance, admin: true})
      setTimeout( () => window.location.href=url, 100);
    },
    async confirm (id) {
      try {
        this.loading = true
        await this.$axios.$get(`/event/confirm/${id}`)
        this.loading = false
        Message({
          message: this.$t('event_confirmed'),
          type: 'success'
        })
        this.events = this.events.filter(e => e.id !== id)
      } catch (e) {
      }
    }
  }
}
</script>