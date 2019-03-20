<template lang="pug">
  b-modal(hide-footer @hidden='$router.replace("/")' :title='$t("Admin")' 
    :visible='true' size='lg')
    el-tabs(tabPosition='left' v-model='tab')

      //- USERS
      el-tab-pane.pt-1
        template(slot='label')
          v-icon(name='users')
          span.ml-1 {{$t('Users')}}
        el-table(:data='paginatedUsers' small)
          el-table-column(label='Email')
            template(slot-scope='data')
              el-popover(trigger='hover' :content='data.row.description' width='400')
                span(slot='reference') {{data.row.email}}
          el-table-column(label='Azioni')
            template(slot-scope='data')
              el-button.mr-1(size='mini'
                :type='data.row.is_active?"warning":"success"'
                @click='toggle(data.row)') {{data.row.is_active?$t('Deactivate'):$t('Activate')}}
              el-button(size='mini'
                :type='data.row.is_admin?"danger":"warning"'
                @click='toggleAdmin(data.row)') {{data.row.is_admin?$t('Remove Admin'):$t('Admin')}}
        el-pagination(:page-size='perPage' :currentPage.sync='userPage' :total='users.length')

      //- PLACES
      el-tab-pane.pt-1
        template(slot='label')
          v-icon(name='map-marker-alt')
          span.ml-1 {{$t('Places')}}
        p {{$t('admin_place_explanation')}}
        el-form.mb-2(:inline='true' label-width='120px')
          el-form-item(:label="$t('Name')")
            el-input.mr-1(:placeholder='$t("Name")' v-model='place.name')
          el-form-item(:label="$t('Address')")
            el-input.mr-1(:placeholder='$t("Address")' v-model='place.address')
          el-button(variant='primary' @click='savePlace') {{$t('Save')}}
        b-table(selectable :items='places' :fields='placeFields' striped hover 
          small selectedVariant='success'  primary-key='id' 
          select-mode="single" @row-selected='placeSelected'
          :per-page='perPage' :current-page='placePage')
        el-pagination(:page-size='perPage' :currentPage.sync='placePage' :total='places.length')

      //- EVENTS
      el-tab-pane.pt-1
        template(slot='label')
          v-icon(name='calendar')
          span.ml-1 {{$t('Events')}}
        p {{$t('event_confirm_explanation')}}
        el-table(:data='paginatedEvents' small primary-key='id' v-loading='loading')
          el-table-column(:label='$t("Name")')
            template(slot-scope='data') {{data.row.title}}
          el-table-column(:label='$t("Where")')
            template(slot-scope='data') {{data.row.place.name}}
          el-table-column(:label='$t("Confirm")')
            template(slot-scope='data')
              el-button(type='primary' @click='confirm(data.row.id)' size='mini') {{$t('Confirm')}}
              el-button(type='success' @click='preview(data.row.id)' size='mini') {{$t('Preview')}}

        el-pagination(:page-size='perPage' :currentPage.sync='eventPage' :total='events.length')

      //- TAGS
      el-tab-pane.pt-1
        template(slot='label')
          v-icon(name='tag')
          span  {{$t('Tags')}}
        p {{$t('admin_tag_explanation')}}
          el-tag(v-if='tag.tag' :color='tag.color || "grey"' size='mini') {{tag.tag}}
        el-form(:inline='true' label-width='120px')
          el-form-item(:label="$t('Color')")
            el-color-picker(v-model='tag.color' @change='updateColor')
        el-table(:data='paginatedTags' striped small hover
          highlight-current-row @current-change="tagSelected")
          el-table-column(label='Tag')
            template(slot-scope='data')
              el-tag(:color='data.row.color || "grey"' size='mini') {{data.row.tag}}
        el-pagination(:page-size='perPage' :currentPage.sync='tagPage' :total='tags.length')

      //- SETTINGS
      el-tab-pane.pt-1
        template(slot='label')
          v-icon(name='tools')
          span  {{$t('Settings')}}
        el-form(inline)
          span {{$t('admin_mastodon_explanation')}}
          el-input(v-model="mastodon_instance")
            span(slot='prepend') {{$t('Mastodon instance')}}
            el-button(slot='append' @click='associate' variant='success' type='success') {{$t('Associate')}}

</template>
<script>
import { mapState } from 'vuex'
import api from '@/api'
import { Message } from 'element-ui'

export default {
  name: 'Admin',
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
    const code = this.$route.query.code
    if (code) {
      this.tab = "4"
      const instance = await api.setCode({code, is_admin: true})
    }
    this.users = await api.getUsers()
    this.events = await api.getUnconfirmedEvents()
    this.settings = await api.getAdminSettings()
    this.mastodon_instance = this.settings.mastodon_auth && this.settings.mastodon_auth.instance
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
    }
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
      this.tag = tag
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
      const newTag = await api.updateTag(this.tag)
    },
    preview (id) {
      this.$router.push(`/event/${id}`)
    },
    async associate () {
      if (!this.mastodon_instance) return
      const url = await api.getAuthURL({instance: this.mastodon_instance, admin: true})
      setTimeout( () => window.location.href=url, 100);
    },
    async confirm (id) {
      try {
        this.loading = true
        await api.confirmEvent(id)
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