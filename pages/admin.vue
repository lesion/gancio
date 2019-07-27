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

        el-form(inline label-width="400px")

          //- allow open registration
          el-form-item(:label="$t('admin.allow_registration_description')")
            el-switch(name='reg' v-model='allow_registration')

          //- allow anon event
          el-form-item(:label="$t('admin.allow_anon_event')")
            el-switch(v-model='allow_anon_event')

          el-form-item(:label="$t('admin.allow_recurrent_event')")
            el-switch(v-model='allow_recurrent_event')

          el-form-item(v-show='allow_recurrent_event' :label="$t('admin.recurrent_event_visible')")
            el-switch(v-model='recurrent_event_visible')

        el-divider {{$t('admin.federation')}}
        el-form(inline @submit.native.prevent='associate_mastondon_instance' label-width='240px')
          p {{$t('admin.mastodon_description')}}
          el-form-item(:label='$t("admin.mastodon_instance")')
            el-input(v-model="mastodon_instance")
          el-form-item
            el-button(native-type='submit' type='success' :disabled='!mastodon_instance') {{$t('common.associate')}}
          el-form-item(:label="$t('admin.allow_comments')")
            el-switch(v-model='allow_comments')

</template>
<script>
import { mapState, mapActions } from 'vuex'
import { Message, MessageBox } from 'element-ui'
import Users from '../components/admin/Users'
import Places from '../components/admin/Places'

export default {
  name: 'Admin',
  components: { Users, Places },
  middleware: ['auth'],
  data () {
    return {
      perPage: 10,
      eventPage: 1,
      tagPage: 1,
      tagFields: ['tag', 'color'],
      description: '',
      tag: {name: '', color: ''},
      events: [],
      loading: false,
      tab: "0",
      open: true,
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
    ...mapState(['tags', 'settings']),
    allow_registration: {
      get () { return this.settings.allow_registration },
      set (value) { this.setSetting({ key: 'allow_registration', value }) }
    },
    allow_anon_event: {
      get () { return this.settings.allow_anon_event },
      set (value) { this.setSetting({ key: 'allow_anon_event', value })}
    },
    allow_recurrent_event: {
      get () { return this.settings.allow_recurrent_event },
      set (value) { this.setSetting({ key: 'allow_recurrent_event', value })}
    },
    recurrent_event_visible: {
      get () { return this.settings.recurrent_event_visible },
      set (value) { this.setSetting({ key: 'recurrent_event_visible', value })}
    },
    allow_comments: {
      get () { return this.settings.allow_comments },
      set (value) { this.setSetting({ key: 'allow_comments', value })}
    },    
    paginatedEvents () {
      return this.events.slice((this.eventPage-1) * this.perPage,
        this.eventPage * this.perPage)
    },
    paginatedTags () {
      return this.tags.slice((this.tagPage-1) * this.perPage,
        this.tagPage * this.perPage)
    },
  },
  methods: {
    ...mapActions(['setSetting']),
    tagSelected (tag) {
      this.tag = { color: tag.color, tag: tag.tag }
    },
    preview (id) {
      this.$router.push(`/event/${id}`)
    },
    async associate_mastondon_instance () {
      if (!this.mastodon_instance) return false

      const url = await this.$axios.$post('/settings/getauthurl', { instance: this.mastodon_instance })
      setTimeout( () => window.location.href=url, 100);
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
