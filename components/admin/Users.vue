<template lang="pug">
v-container
  v-card-title {{$t('common.users')}}
    v-spacer
    v-text-field(v-model='search'
      :append-icon='mdiMagnify' outlined rounded
      :label="$t('common.search')"
      single-line hide-details)

  v-btn(color='primary' text @click='newUserDialog = true') <v-icon v-text='mdiPlus'></v-icon> {{$t('common.new_user')}}

  //- ADD NEW USER
  v-dialog(v-model='newUserDialog' :fullscreen='$vuetify.breakpoint.xsOnly')

    v-card
      v-card-title {{$t('common.new_user')}}
      v-card-text
        v-form(v-model='valid' ref='user_form' lazy-validation @submit.prevent='createUser')
          v-col
            v-text-field.col-4(v-model='new_user.email'
              :label="$t('common.email')"
              :rules="$validators.email")
          v-col
            v-select.col-4(v-model='new_user.role' :label="$t('common.role')" :items="['admin', 'editor', 'user']")
          v-text-field(v-model='new_user.description' :label="$t('common.description')")
          //- v-switch.d-inline-block.mr-5(v-model='new_user.is_admin' :label="$t('common.admin')" inset)
          //- v-switch.d-inline-block(v-if='!new_user.is_admin' v-model='new_user.is_editor' :label="$t('common.editor')" inset)
        v-alert(type='info' :closable='false' :icon='mdiInformation') {{$t('admin.user_add_help')}}
        v-card-actions
          v-spacer
          v-btn(@click='newUserDialog=false' color='error' outlined) {{$t('common.cancel')}}
          v-btn(@click='createUser' :disabled='!valid' color='primary' outlined) {{$t('common.send')}}

  //- CHANGE ROLE
  v-dialog(v-model='changeRoleDialog' width=300)
    v-card(v-if='selected_user')
      v-card-content
        h2 {{$t('common.change_role')}}
        v-list(nav dense)
          v-list-item(v-for="role in ['admin', 'editor', 'user'].filter(r => r !== selected_user.role)" :key='role' link @click='changeRole(role)')
            v-list-item-content
              v-list-item-title {{ role }}

  v-card-text
    //- USERS LIST
    v-data-table(
      :headers='headers'
      :items='users'
      :hide-default-footer='users.length<5'
      :header-props='{ sortIcon: mdiChevronDown }'
      :footer-props='{ prevIcon: mdiChevronLeft, nextIcon: mdiChevronRight }'
      :search='search')
      template(v-slot:item.is_active='{item}')
        v-switch(:input-value='item.is_active' readonly @click.native.prevent="toggle(item)" inset hide-details)
      template(v-slot:item.role='{item}')
        v-menu(offset-y)
          template(v-slot:activator="{ on, attrs }")
            v-btn(:color='role_colors[item.role ]' v-bind='attrs' v-on="on" small label) {{ item.role }}
          v-list(width=100 nav color='secondary')
            v-list-item(v-for="role in ['admin', 'editor', 'user'].filter(r => r !== item.role)" :key='role' link @click='changeRole(role)')
              v-list-item-content
                v-list-item-title {{ role }}

        //- v-select(v-model="item.role" :items='["user", "editor", "admin"]' dense hide-details
        //-   @change="selected => changeRole(item, selected)")
      template(v-slot:item.actions='{item}')
        v-btn(text small @click='deleteUser(item)' color='error' ) {{$t('admin.delete_user')}}

</template>
<script>
import { mapState } from 'vuex'
import get from 'lodash/get'
import { mdiClose, mdiMagnify, mdiCheck, mdiPlus, mdiInformation, mdiChevronLeft, mdiChevronRight, mdiChevronDown } from '@mdi/js'

export default {
  name: 'Users',
  props: {
    users: { type: Array, default: () => [] }
  },
  data () {
    return {
      mdiClose, mdiMagnify, mdiCheck, mdiPlus, mdiInformation, mdiChevronLeft, mdiChevronRight, mdiChevronDown,
      newUserDialog: false,
      changeRoleDialog: false,
      role_colors: { admin: 'error', editor: 'secondary', user: 'success' },
      valid: false,
      selected_user: null,
      new_user: {
        email: '',
        is_admin: false
      },
      search: '',
      headers: [
        { value: 'email', text: this.$t('common.email'), width: 150 },
        { value: 'description', text: this.$t('common.description') },
        { value: 'is_active', text: 'Active', width: 50 },
        { value: 'role', text: 'Role', width: 150 },
        // { value: 'is_editor', text: 'Editor' },
        { value: 'actions', text: this.$t('common.actions'), align: 'right', width: 100 }
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
      // ask confirmation only to disable
      if (user.is_active) {

        const ret = await this.$root.$confirm('admin.disable_user_confirm', { user: user.email })
        if (!ret) { return }
      }
      user.is_active = !user.is_active
      this.$axios.$put('/user', user)
    },
    chooseRole (user) {
      this.changeRoleDialog = true
      this.selected_user = user
    },
    async changeRole (user, role) {
      // ask confirmation?
      const configMsg = user.is_admin ? 'admin.disable_admin_user_confirm' : 'admin.enable_admin_user_confirm'
      const ret = await this.$root.$confirm(configMsg, { user: user.email })
      if (!ret) { return }
      try {
        await this.$axios.$put('/user', { ...user, role })
        user.role = role
      } catch (e) {
        console.error(e)
      }
      return false
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
