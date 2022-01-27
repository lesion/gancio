<template lang="pug">
  v-container
    v-card-title {{$t('common.multisite')}}
      v-spacer
      v-text-field(v-model='search'
        append-icon='mdi-magnify' outlined rounded
        label='Search'
        single-line hide-details)

    v-btn(color='primary' text @click='newSiteDialog = true') <v-icon>mdi-plus</v-icon> {{$t('common.new_site')}}

    //- ADD NEW SITE
    v-dialog(v-model='newSiteDialog' :fullscreen='$vuetify.breakpoint.xsOnly')

      v-card(color='secondary')
        v-card-title {{$t('common.new_site')}}
        v-card-text
          v-form(v-model='valid' ref='site_form' lazy-validation @submit.prevent='createSite')
            v-text-field(v-model='site.hostname'
              :label="$t('common.hostname')"
              :rules="[$validators.required]")
            v-text-field(v-model='site.email'
              :label="$t('common.email')"
              :rules="$validators.email")
          v-alert(type='info' :closable='false') {{$t('admin.site_add_help')}}
          v-card-actions
            v-spacer
            v-btn(@click='newSiteDialog=false' color='error') {{$t('common.cancel')}}
            v-btn(@click='createSite' :disabled='!valid' color='primary') {{$t('common.send')}}

    v-card-text
      //- SITES LIST
      v-data-table(
        :headers='headers'
        :items='sites'
        :hide-default-footer='sites.length<5'
        :search='search')
        template(v-slot:item.is_active='{item}')
          v-icon(v-if='item.is_active' color='success') mdi-check
          v-icon(v-else color='warning') mdi-close
        //- template(v-slot:item.actions='{item}')
            //-   v-btn(v-if='item.recover_code' text small :to='`/user_confirm/${item.recover_code}`') {{$t('common.confirm')}}
            //-   v-btn(text small @click='toggle(item)'
            //- :color='item.is_active?"warning":"success"') {{item.is_active?$t('common.disable'):$t('common.enable')}}
            //-   v-btn(text small @click='toggleAdmin(item)'
            //- :color='item.is_admin?"warning":"error"') {{item.is_admin?$t('common.remove_admin'):$t('common.admin')}}
            //-   v-btn(text small @click='deleteUser(item)'
            //- color='error') {{$t('admin.delete_user')}}

</template>
<script>
import { mapState } from 'vuex'
import get from 'lodash/get'

export default {
  name: 'Sites',
  props: {
    sites: { type: Array, default: () => [] }
  },
  data () {
    return {
      newSiteDialog: false,
      valid: false,
      site: {
        email: '',
        is_active: true,
        hostname: ''
      },
      sites: [],
      search: '',
      headers: [
          { value: 'hostname', text: 'Hostname' },
        { value: 'is_active', text: 'Active' },
        { value: 'actions', text: 'Actions', align: 'right' }
      ]
    }
  },
  async mounted () {
    this.sites = await this.$axios.$get('/sites')
  },
  computed: mapState(['settings']),
  methods: {
    // async deleteUser (user) {
    //   const ret = await this.$root.$confirm('admin.delete_user_confirm', { user: user.email })
    //   if (!ret) { return }
    //   try {
    //     this.loading = true
    //     await this.$axios.$delete(`/user/${user.id}`)
    //     this.$root.$message('admin.user_remove_ok')
    //     this.$emit('update')
    //   } catch (e) {
    //     const err = get(e, 'response.data.errors[0].message', e)
    //     this.$root.$message(this.$t(err), { color: 'error' })
    //     this.loading = false
    //   }
    // },
    // async toggle (site) {
    //   if (site.is_active) {
    //     const ret = await this.$root.$confirm('admin.disable_domain_confirm', { user: user.email })
    //     if (!ret) { return }
    //   }
    //   user.is_active = !user.is_active
    //   this.$axios.$put('/domain', user)
    // },
    // async toggleAdmin (user) {
    //   try {
    //     user.is_admin = !user.is_admin
    //     await this.$axios.$put('/domain', user)
    //   } catch (e) {
    //   }
    // },
    async createSite () {
      if (!this.$refs.site_form.validate()) { return }
      try {
        this.loading = true
        const site = await this.$axios.$post('/site', this.site)
        this.site = { hostname: '', email: '', is_active: true }
        this.sites.push(site)
        this.$root.$message('admin.site_create_ok', { color: 'success' })
        this.$emit('update')
        this.loading = false
        this.newSiteDialog = false
      } catch (e) {
        const err = get(e, 'response.data.errors[0].message', e)
        this.$root.$message(this.$t(err), { color: 'error' })
        this.loading = false
      }
    }
  }
}
</script>
