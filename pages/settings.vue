<template lang="pug">
  el-main
    h4 <nuxt-link to='/'><img src='/favicon.ico'/></nuxt-link> {{$t('common.settings')}}

    el-divider {{$auth.user.email}}
    el-form(action='/api/user' method='PUT' @submit.native.prevent='update_settings' inline label-width='200px')

      el-form-item(:label="$t('settings.change_password')")
        el-input(v-model='password' type='password')

      //- allow federation
      div(v-if='settings.enable_federation')
        el-form-item(:label="$t('admin.enable_federation')")
          el-switch(v-model='user.settings.enable_federation')

        div(v-if='user.settings.enable_federation')
          el-form-item(:label="$t('common.username')")
            el-input(v-if='username_editable' type='text' name='username' v-model='user.username')
              template(slot='suffix') @{{baseurl}}
            span(v-else) {{user.username}}@{{baseurl}}
              //- el-button(slot='append') {{$t('common.save')}}

          el-form-item(:label="$t('common.displayname')")
            el-input(type='text' v-model='user.display_name')

      el-button(type='success' native-type='submit') {{$t('common.save')}}

    el-divider {{$t('settings.danger_section')}}
    p {{$t('settings.remove_account')}}
    el-button(type='danger' @click='remove_account') {{$t('common.remove')}}
</template>
<script>
import { mapState, mapActions } from 'vuex'
import { Message, MessageBox } from 'element-ui'
import url from 'url'

export default {
  name: 'Settings',
  data () {
    return {
      password: '',
      user: { }
    }
  },
  head () {
    return {
      title: `${this.settings.title} - ${this.$t('common.settings')}`
    }
  },
  async asyncData ({ $axios, params }) {
    const user = await $axios.$get('/auth/user')
    return { user }
  },
  computed: {
    ...mapState(['settings']),
    baseurl () {
      return url.parse(this.settings.baseurl).host
    }
  },
  methods: {
    async change_password () {
      if (!this.password) { return }
      const user_data = { id: this.$auth.user.id, password: this.password }
      try {
        const user = await this.$axios.$put('/user', user_data)
        Message({ message: this.$t('settings.password_updated'), showClose: true, type: 'success' })
        this.$router.replace('/')
      } catch (e) {
        console.log(e)
      }
    },
    async update_settings () {
      MessageBox.confirm(this.$t('settings.update_confirm'),
        this.$t('common.confirm'), {
          confirmButtonText: this.$t('common.ok'),
          cancelButtonText: this.$t('common.cancel'),
          type: 'error'
        }).then(async () => {
        this.user = await this.$axios.$put('/user', { ...this.user, password: this.password })
      }).catch(e => {
        Message({ message: e, showClose: true, type: 'warning' })
      })
    },
    async remove_account () {
      MessageBox.confirm(this.$t('settings.remove_account_confirm'), this.$t('common.confirm'), {
        confirmButtonText: this.$t('common.ok'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'error'
      }).then(() => {
        this.$axios.$delete('/user')
        this.$auth.logout()
        this.$router.replace('/')
      })
    }
  }
}
</script>
