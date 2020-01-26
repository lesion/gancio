<template lang="pug">
  el-main

    p {{$auth.user.email}}
    //- el-form(action='/api/user' method='PUT' @submit.native.prevent='update_settings' inline label-width='200px')
    //-   el-form-item(:label="$t('settings.change_password')")
    //-     el-input(v-model='password' type='password')
    //-   el-button(type='success' native-type='submit') {{$t('common.save')}}

    el-divider {{$t('settings.danger_section')}}
    p {{$t('settings.remove_account')}}
    el-button(type='danger' @click='remove_account') {{$t('common.remove')}}
</template>
<script>
import { mapState } from 'vuex'
import { MessageBox } from 'element-ui'
import url from 'url'

export default {
  name: 'Settings',
  middleware: ['auth'],
  data () {
    return {
      password: '',
      user: { }
    }
  },
  computed: {
    ...mapState(['settings']),
    baseurl () {
      return url.parse(this.settings.baseurl).host
    }
  },
  methods: {
    // async change_password () {
    //   if (!this.password) { return }
    //   const user_data = { id: this.$auth.user.id, password: this.password }
    //   try {
    //     await this.$axios.$put('/user', user_data)
    //     Message({ message: this.$t('settings.password_updated'), showClose: true, type: 'success' })
    //     this.$router.replace('/')
    //   } catch (e) {
    //     console.log(e)
    //   }
    // },
    // update_settings () {
    //   MessageBox.confirm(this.$t('settings.update_confirm'),
    //     this.$t('common.confirm'), {
    //       confirmButtonText: this.$t('common.ok'),
    //       cancelButtonText: this.$t('common.cancel'),
    //       type: 'error'
    //     }).then(async () => {
    //     this.user = await this.$axios.$put('/user', { ...this.user, password: this.password })
    //   }).catch(e => {
    //     Message({ message: e, showClose: true, type: 'warning' })
    //   })
    // },
    remove_account () {
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
  },
  head () {
    return {
      title: `${this.settings.title} - ${this.$t('common.settings')}`
    }
  }
}
</script>
