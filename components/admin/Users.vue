<template lang="pug">
v-container
  v-card-title {{$t('common.users')}}
    v-spacer
    v-text-field(v-model='search'
      :append-icon='mdiMagnify' outlined rounded
      label='Search'
      single-line hide-details)

  v-btn(color='primary' text @click='newUserDialog = true') <v-icon v-text='mdiPlus'></v-icon> {{$t('common.new_user')}}

  //- ADD NEW USER
  v-dialog(v-model='newUserDialog' :fullscreen='$vuetify.breakpoint.xsOnly')

    v-card(color='secondary')
      v-card-title {{$t('common.new_user')}}
      v-card-text
        v-form(v-model='valid' ref='user_form' lazy-validation @submit.prevent='createUser')
          v-text-field(v-model='new_user.email'
            :label="$t('common.email')"
            :rules="$validators.email")
          v-switch(v-model='new_user.is_admin' :label="$t('common.admin')" inset)
        v-alert(type='info' :closable='false' :icon='mdiInformation') {{$t('admin.user_add_help')}}
        v-card-actions
          v-spacer
          v-btn(@click='newUserDialog=false' color='error' outlined) {{$t('common.cancel')}}
          v-btn(@click='createUser' :disabled='!valid' color='primary' outlined) {{$t('common.send')}}

  v-card-text
    //- USERS LIST
    v-data-table(
      :headers='headers'
      :items='users'
      :hide-default-footer='users.length<5'
      :footer-props='{ prevIcon: mdiChevronLeft, nextIcon: mdiChevronRight }'
      :search='search')
      template(v-slot:item.is_active='{item}')
        v-icon(v-if='item.is_active' color='success' v-text='mdiCheck')
        v-icon(v-else color='warning' v-text='mdiClose')
      template(v-slot:item.actions='{item}')
        v-btn(v-if='item.recover_code' text small :to='`/user_confirm/${item.recover_code}`') {{$t('common.confirm')}}
        v-btn(text small @click='toggle(item)'
          :color='item.is_active?"warning":"success"') {{item.is_active?$t('common.disable'):$t('common.enable')}}
        v-btn(text small @click='toggleAdmin(item)'
          :color='item.is_admin?"warning":"error"') {{item.is_admin?$t('common.remove_admin'):$t('common.admin')}}
        v-btn(text small @click='deleteUser(item)'
          color='error') {{$t('admin.delete_user')}}

</template>
<script>
import { mapState } from 'vuex'
import get from 'lodash/get'
import { mdiClose, mdiMagnify, mdiCheck, mdiPlus, mdiInformation, mdiChevronLeft, mdiChevronRight } from '@mdi/js'

export default {
  name: 'Users',
  props: {
    users: { type: Array, default: () => [] }
  },
  data () {
    return {
      mdiClose, mdiMagnify, mdiCheck, mdiPlus, mdiInformation, mdiChevronLeft, mdiChevronRight,
      newUserDialog: false,
      valid: false,
      new_user: {
        email: '',
        is_admin: false
      },
      search: '',
      headers: [
        { value: 'email', text: 'Email' },
        { value: 'description', text: 'Description' },
        { value: 'is_active', text: 'Active' },
        { value: 'actions', text: 'Actions', align: 'right' }
      ]
    }
  },
  computed: mapState(['settings']),
  methods: {
    async deleteUser (user) {
      const ret = await this.$root.$confirm('admin.delete_user_confirm', { user: user.email })
      if (!ret) { return }
      try {
        this.loading = true
        await this.$axios.$delete(`/user/${user.id}`)
        this.$root.$message('admin.user_remove_ok')
        this.$emit('update')
      } catch (e) {
        const err = get(e, 'response.data.errors[0].message', e)
        this.$root.$message(this.$t(err), { color: 'error' })
        this.loading = false
      }
    },
    async toggle (user) {
      if (user.is_active) {
        const ret = await this.$root.$confirm('admin.disable_user_confirm', { user: user.email })
        if (!ret) { return }
      }
      user.is_active = !user.is_active
      this.$axios.$put('/user', user)
    },
    async toggleAdmin (user) {
      try {
        const configMsg = user.is_admin ? 'admin.disable_admin_user_confirm' : 'admin.enable_admin_user_confirm'
        const ret = await this.$root.$confirm(configMsg, { user: user.email })
        if (!ret) { return }
        user.is_admin = !user.is_admin
        await this.$axios.$put('/user', user)
      } catch (e) {
      }
    },
    async createUser () {
      if (!this.$refs.user_form.validate()) { return }
      try {
        this.loading = true
        await this.$axios.$post('/user', this.new_user)
        this.new_user = { email: '', is_admin: false }
        this.$root.$message('admin.user_create_ok', { color: 'success' })
        this.$emit('update')
        this.loading = false
        this.newUserDialog = false
      } catch (e) {
        const err = get(e, 'response.data.errors[0].message', e)
        this.$root.$message(this.$t(err), { color: 'error' })
        this.loading = false
      }
    }
  }
}
</script>
