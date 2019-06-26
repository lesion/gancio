<template lang="pug">
  el-card
    nuxt-link.float-right(to='/')
      v-icon(name='times' color='red')
    h5 {{$t('common.admin')}}

    el-tabs(v-model='tab')

      //- USERS
      el-tab-pane.pt-1
        template(slot='label')
          v-icon(name='users')
          span.ml-1 {{$t('common.users')}}
        el-collapse
          el-collapse-item
            template(slot='title')
              p {{$t('common.new_user')}}
            el-form(inline)
              el-form-item(:label="$t('common.email')")
                el-input(v-model='new_user.email')
              el-form-item(:label="$t('common.password')")
                el-input(v-model='new_user.password' type='password')
              el-form-item(:label="$t('common.admin')")
                el-switch(v-model='new_user.admin')
              el-button.float-right(@click='create_user' type='success' plain) {{$t('common.send')}}
        el-table(:data='paginatedUsers' small)
          el-table-column(label='Email')
            template(slot-scope='data')
              el-popover(trigger='hover' :content='data.row.description' width='400')
                span(slot='reference') {{data.row.email}}
          el-table-column(:label="$t('common.actions')")
            template(slot-scope='data')
              div(v-if='data.row.id!==$auth.user.id')
                el-button.mr-1(size='mini'
                  :type='data.row.is_active?"warning":"success"'
                  @click='toggle(data.row)') {{data.row.is_active?$t('common.deactivate'):$t('common.activate')}}
                el-button(size='mini'
                  :type='data.row.is_admin?"danger":"warning"'
                  @click='toggleAdmin(data.row)') {{data.row.is_admin?$t('admin.remove_admin'):$t('common.admin')}}
                el-button(size='mini'
                  type='danger'
                  @click='delete_user(data.row)') {{$t('admin.delete_user')}}
              div(v-else)
                span {{$t('common.me')}}
          no-ssr
            el-pagination(:page-size='perPage' :currentPage.sync='userPage' :total='users.length')

      //- PLACES
      el-tab-pane.pt-1
        template(slot='label')
          v-icon(name='map-marker-alt')
          span.ml-1 {{$t('common.places')}}
        p(v-html="$t('admin.place_description')")
        el-form.mb-2(:inline='true' label-width='120px')
          el-form-item(:label="$t('common.name')")
            el-input.mr-1(:placeholder='$t("common.name")' v-model='place.name')
          el-form-item(:label="$t('common.address')")
            el-input.mr-1(:placeholder='$t("common.address")' v-model='place.address')
          el-button(variant='primary' @click='savePlace') {{$t('common.save')}}
        el-table(:data='paginatedPlaces' small @current-change="val => place=val")
          el-table-column(:label="$t('common.name')")
            template(slot-scope='data') {{data.row.name}}
          el-table-column(:label="$t('common.address')")
            template(slot-scope='data') {{data.row.address}}
        no-ssr
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
        no-ssr
          el-pagination(:page-size='perPage' :currentPage.sync='eventPage' :total='events.length')

      //- SETTINGS
      el-tab-pane.pt-1
        template(slot='label')
          v-icon(name='cog')
          span  {{$t('common.settings')}}

        el-form(inline @submit.native.prevent='associate_mastondon_instance' label-width='140px')
          p {{$t('admin.mastodon_description')}}
          el-form-item(:label='$t("admin.mastodon_instance")')
            el-input(v-model="mastodon_instance")
          el-form-item
            el-button(native-type='submit' type='success' :disabled='!mastodon_instance') {{$t('common.associate')}}
          hr
          p {{$t('admin.allow_registration_description')}}
          el-form-item(:label="allow_registration?$t('common.disable'):$t('common.enable')")
            el-switch(v-model='allow_registration')
          p {{$t('admin.allow_anon_event')}}
          el-form-item(:label="allow_anon_event?$t('common.disable'):$t('common.enable')")
            el-switch(v-model='allow_anon_event')


</template>
<script>
import { mapState, mapActions } from 'vuex'
import { Message, MessageBox } from 'element-ui'

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
      new_user: {
        email: '',
        password: '',
        admin: false,
      },
      tab: "0",
      open: true
    }
  },
  async mounted () {
    const code = this.$route.query.code

    if (code) {
      this.tab = "4"
      const instance = await this.$axios.$post('/user/code', {code, is_admin: true})
    }
  },
  async asyncData ({ $axios, params, store }) {
    try {
      const users = await $axios.$get('/users')
      const events = await $axios.$get('/event/unconfirmed')
      return { users, events, mastodon_instance: store.state.settings.mastodon_instance }
    } catch ( e ) {
      console.error(e)
    }
  },
  computed: {
    ...mapState(['tags', 'places', 'settings']),
    allow_registration: {
      get () { return this.settings.allow_registration },
      set (value) { this.setSetting({ key: 'allow_registration', value }) }
    },
    allow_anon_event: {
      get () { return this.settings.allow_anon_event },
      set (value) { this.setSetting({ key: 'allow_anon_event', value })}
    },
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
    ...mapActions(['setSetting']),
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
      const place = await this.$axios.$put('/place', this.place)
    },
    async toggle(user) {
      user.is_active = !user.is_active
      this.$axios.$put('/user', user)
    },
    async toggleAdmin(user) {
      console.error(this.$auth.user)
      if (user.id === this.$auth.user.id) return
      user.is_admin = !user.is_admin
      try {
        this.$axios.$put('/user', user)
      } catch(e) {
        console.error(e)
      }
    },
    preview (id) {
      this.$router.push(`/event/${id}`)
    },
    async associate_mastondon_instance () {
      if (!this.mastodon_instance) return false

      const url = await this.$axios.$post('/settings/getauthurl', { instance: this.mastodon_instance })
      setTimeout( () => window.location.href=url, 100);
    },
    async delete_user (user) {
      MessageBox.confirm(this.$t('admin.delete_user_confirm'),
        this.$t('common.confirm'), {
          confirmButtonText: this.$t('common.ok'),
          cancelButtonText: this.$t('common.cancel'),
          type: 'error'
        })
        .then( () => this.$axios.delete(`/user/${user.id}`) )
        .then( () => {
          Message({
            showClose: true,
            type: 'success',
            message: this.$t('admin.user_remove_ok')
          })
          this.users = this.users.filter(u => u.id!==user.id)
        })
    },
    async create_user () {
      try {
        this.loading = true
        const user = await this.$axios.$post('/user', this.new_user)
        this.new_user = { email: '', password: '', is_admin: false }
        Message({
          showClose: true,
          type: 'success',
          message: this.$t('admin.user_create_ok')
        })
        this.users.push(user)
      } catch (e) {
        Message({
          showClose: true,
          type: 'error',
          message: this.$t('user.error_create') + e
        })
      }
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
    },
  }
}
</script>