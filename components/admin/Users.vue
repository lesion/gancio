<template lang="pug">
  v-container

    //- ADD NEW USER
    v-dialog(v-model='newUser' width='500')
      template(v-slot:activator="{ on }")
        v-btn(text v-on='on') <v-icon>mdi-plus</v-icon> {{$t('common.new_user')}}

      v-card
        v-card-title <v-icon name='plus'/> {{$t('common.new_user')}}
        v-card-text
          v-form(inline @submit.native.prevent='create_user')
            v-text-field(v-model='new_user.email'
              :label="$t('common.email')")
            v-switch(v-model='new_user.is_admin' :label="$t('common.admin')" inset)
          v-alert(type='info' :closable='false') {{$t('admin.user_add_help')}}
          v-card-actions
            v-btn(@click='create_user' color='success' plain) {{$t('common.send')}}

    //- USERS LIST
    v-data-table(
      :headers='headers'
      :items='users')
      template(v-slot:item.actions='{item}')
        v-btn(text small @click='toggle(item)'
          :color='item.is_active?"warning":"success"') {{item.is_active?$t('common.deactivate'):$t('common.activate')}}
        v-btn(text small @click='toggleAdmin(item)'
          :color='item.is_admin?"warning":"error"') {{item.is_admin?$t('common.remove_admin'):$t('common.admin')}}
        v-btn(text small @click='deleteUser(item)'
          :color='danger') {{$t('admin.delete_user')}}

      //- el-table-column(label='Email' width='220')
      //-   template(slot-scope='data')
      //-     el-popover(trigger='hover' :content='data.row.description' width='400')
      //-       span(slot='reference') {{data.row.email}}
      //- el-table-column(:label="$t('common.actions')")
      //-   template(slot-scope='data')
      //-     div(v-if='data.row.id!==$auth.user.id')
      //-       el-button-group
      //-         el-button(size='mini'
      //-           :type='data.row.is_active?"warning":"success"'
      //-           @click='toggle(data.row)') {{data.row.is_active?$t('common.deactivate'):$t('common.activate')}}
      //-         el-button(size='mini'
      //-           :type='data.row.is_admin?"danger":"warning"'
      //-           @click='toggleAdmin(data.row)') {{data.row.is_admin?$t('admin.remove_admin'):$t('common.admin')}}
      //-         el-button(size='mini'
      //-           type='danger'
      //-           @click='delete_user(data.row)') {{$t('admin.delete_user')}}
      //-     div(v-else)
      //-       span {{$t('common.me')}}
      //- v-pagination(:page-size='perPage' :currentPage.sync='userPage' v-if='perPage<users_.length' :total='users_.length')

</template>
<script>
import { Message, MessageBox } from 'element-ui'
import { mapState } from 'vuex'

export default {
  name: 'Users',
  props: {
    users: { type: Array, default: () => [] }
  },
  data () {
    return {
      new_user: {
        email: '',
        is_admin: false
      },
      headers: [
        { value: 'email', text: 'Email' },
        { value: 'actions', text: 'Actions', align: 'right' }
      ]
    }
  },
  computed: mapState(['settings']),
  methods: {
    deleteUser (user) {
      MessageBox.confirm(this.$t('admin.delete_user_confirm'),
        this.$t('common.confirm'), {
          confirmButtonText: this.$t('common.ok'),
          cancelButtonText: this.$t('common.cancel'),
          type: 'error'
        })
        .then(() => this.$axios.delete(`/user/${user.id}`))
        .then(() => {
          Message({
            showClose: true,
            type: 'success',
            message: this.$t('admin.user_remove_ok')
          })
          this.users_ = this.users_.filter(u => u.id !== user.id)
        })
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
        console.error(e)
      }
    },
    async create_user () {
      try {
        this.loading = true
        const user = await this.$axios.$post('/user', this.new_user)
        this.new_user = { email: '', is_admin: false }
        Message({
          showClose: true,
          type: 'success',
          message: this.$t('admin.user_create_ok')
        })
        this.users_.push(user)
      } catch (e) {
        Message({
          showClose: true,
          type: 'error',
          message: this.$t(e)
        })
      }
    }
  }
}
</script>
