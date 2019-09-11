<template lang="pug">
div
  //- ADD NEW USER
  el-collapse
    el-collapse-item
      template(slot='title')
        h4  <v-icon name='plus'/> {{$t('common.new_user')}}
      el-form(inline)
        el-form-item(:label="$t('common.username')")
          el-input(v-model='new_user.username')
        el-form-item(:label="$t('common.email')")
          el-input(v-model='new_user.email')
        el-form-item(:label="$t('common.admin')")
          el-switch(v-model='new_user.is_admin')
        el-button.float-right(@click='create_user' type='success' plain) {{$t('common.send')}}

  //- USERS LIST
  el-table(:data='paginatedUsers' small)
    el-table-column(label='Username')
      template(slot-scope='data')
        span(slot='reference') {{data.row.username}}
    el-table-column(label='Email')
      template(slot-scope='data')
        el-popover(trigger='hover' :content='data.row.description' width='400')
          span(slot='reference') {{data.row.email}}
    el-table-column(:label="$t('common.actions')")
      template(slot-scope='data')
        div(v-if='data.row.id!==$auth.user.id')
          el-button-group
            el-button(size='mini'
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

  client-only
    el-pagination(:page-size='perPage' :currentPage.sync='userPage' :total='users_.length')

</template>
<script>
import { Message, MessageBox } from 'element-ui'

export default {
  name: 'Users',
  props: ['users'],
  data () {
    return {
      perPage: 10,
      userPage: 1,
      new_user: {
        email: '',
        is_admin: false
      },
      users_: this.users
    }
  },
  computed: {
    paginatedUsers () {
      return this.users_.slice((this.userPage - 1) * this.perPage,
        this.userPage * this.perPage)
    }
  },
  methods: {
    async delete_user (user) {
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
    async toggle (user) {
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
