<template lang="pug">
  v-container
    v-card-title {{$t('common.users')}}
      v-spacer
      v-text-field(v-model='search'
        append-icon='mdi-magnify' outlined rounded
        label='Search'
        single-line hide-details)

    v-btn(color='primary' text @click='newUserDialog = true') <v-icon>mdi-plus</v-icon> {{$t('common.new_user')}}

    //- ADD NEW USER
    v-dialog(v-model='newUserDialog' :fullscreen="$vuetify.breakpoint.xsOnly")

      v-card(color='secondary')
        v-card-title {{$t('common.new_user')}}
        v-card-text
          v-form(v-model='valid' ref='user_form' lazy-validation @submit.prevent='createUser')
            v-text-field(v-model='new_user.email'
              :label="$t('common.email')"
              :rules="$validators.email")
            v-switch(v-model='new_user.is_admin' :label="$t('common.admin')" inset)
          v-alert(type='info' :closable='false') {{$t('admin.user_add_help')}}
          v-card-actions
            v-spacer
            v-btn(@click='newUserDialog=false' color='error') {{$t('common.cancel')}}
            v-btn(@click='createUser' :disabled='!valid' color='primary') {{$t('common.send')}}

    v-card-text
      //- USERS LIST
      v-data-table(
        :headers='headers'
        :items='users'
        :hide-default-footer='users.length<5'
        :search='search')
        template(v-slot:item.is_active='{item}')
          v-icon(v-if='item.is_active' color='success') mdi-check
          v-icon(v-else color='warning') mdi-close
        template(v-slot:item.actions='{item}')
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

export default {
  name: 'Users',
  props: {
    users: { type: Array, default: () => [] }
  },
  data () {
    return {
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
      await this.$axios.delete(`/user/${user.id}`)
      this.$root.$message('admin.user_remove_ok')
      this.$emit('update')
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
