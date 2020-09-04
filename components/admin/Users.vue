<template lang="pug">
  v-container
    v-card-title {{$t('common.users')}}
      v-spacer
      v-text-field(v-model='search'
        append-icon='mdi-magnify'
        label='Search',
        single-line hide-details)
      v-btn(text color='primary' small @click='newUserDialog = true') <v-icon>mdi-plus-user</v-icon> {{$t('common.new_user')}}

    //- ADD NEW USER
    v-dialog(v-model='newUserDialog' width='500')

      v-card
        v-card-title {{$t('common.new_user')}}
        v-card-text
          v-form
            v-text-field(v-model='new_user.email'
              :label="$t('common.email')"
              :rules="[$validators.required('email')]")
            v-switch(v-model='new_user.is_admin' :label="$t('common.admin')" inset)
          v-alert(type='info' :closable='false') {{$t('admin.user_add_help')}}
          v-card-actions
            v-spacer
            v-btn(@click='newUserDialog=false' color='error') {{$t('common.cancel')}}
            v-btn(@click='createUser' color='primary') {{$t('common.send')}}

    v-card-text
      //- USERS LIST
      v-data-table(
        :headers='headers'
        :items='users'
        :search='search')
        template(v-slot:item.actions='{item}')
          v-btn(text small @click='toggle(item)'
            :color='item.is_active?"warning":"success"') {{item.is_active?$t('common.deactivate'):$t('common.activate')}}
          v-btn(text small @click='toggleAdmin(item)'
            :color='item.is_admin?"warning":"error"') {{item.is_admin?$t('common.remove_admin'):$t('common.admin')}}
          v-btn(text small @click='deleteUser(item)'
            color='error') {{$t('admin.delete_user')}}

</template>
<script>
import { mapState } from 'vuex'

export default {
  name: 'Users',
  props: {
    users: { type: Array, default: () => [] }
  },
  data () {
    return {
      newUserDialog: false,
      new_user: {
        email: '',
        is_admin: false
      },
      search: '',
      headers: [
        { value: 'email', text: 'Email' },
        { value: 'is_active', text: 'Active' },
        { value: 'actions', text: 'Actions', align: 'right' }
      ]
    }
  },
  computed: mapState(['settings']),
  methods: {
    async deleteUser (user) {
      const ret = await this.$root.$confirm(this.$t('common.confirm'),
        this.$t('admin.delete_user_confirm'),
        { type: 'error' })
      if (!ret) { return }
      await this.$axios.delete(`/user/${user.id}`)
      this.$root.$message({ message: this.$t('admin.user_remove_ok') })
      this.users_ = this.users_.filter(u => u.id !== user.id)
    },
    toggle (user) {
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
      try {
        this.loading = true
        const user = await this.$axios.$post('/user', this.new_user)
        this.new_user = { email: '', is_admin: false }

        this.$root.$message({
          type: 'success',
          message: this.$t('admin.user_create_ok')
        })
        this.users_.push(user)
      } catch (e) {
        this.$root.$message({
          type: 'error',
          message: this.$t(e)
        })
      }
    }
  }
}
</script>
