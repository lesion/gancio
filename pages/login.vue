<template lang='pug'>
  b-modal(@shown="$refs.email.focus()" :title='$t("common.login")' hide-footer
    @hidden='$router.replace("/")' :visible='true' ref='modal')
    el-form(v-loading='loading')
      p(v-html="$t('login.description')")
      el-input.mb-2(v-model='email' type='email' :placeholder='$t("common.email")' autocomplete='email' ref='email')
        v-icon(name='user' slot='prepend')
      el-input.mb-1(v-model='password'  @keyup.enter.native="submit" type='password' :placeholder='$t("common.password")')
        v-icon(name="lock" slot='prepend')
      el-button.mr-1(plain type="success" @click='submit') {{$t('common.login')}}
      router-link(to='/register')
        el-button.mt-1(plain type="primary") {{$t('login.not_registered')}}
      a.float-right(href='#' @click='forgot') {{$t('login.forgot_password')}}
</template>

<script>
const Cookie = process.client ? require('js-cookie') : undefined
import { mapActions } from 'vuex'
import { Message } from 'element-ui'
// import api from '@/plugins/api'

export default {
  name: 'Login',
  data () {
    return {
      password: '',
      email: '',
      loading: false
    }
  },
  methods: {
    ...mapActions(['login']),
    async forgot () {
      if (!this.email) {
        Message({ message: this.$t('login.insert_email'), type: 'error' })
        this.$refs.email.focus()
        return
      }
      this.loading = true
      // await api.forgotPassword(this.email)
      this.loading = false
      Message({ message: this.$t('login.check_email'), type: 'success' })
    },
    async submit (e) {
      e.preventDefault()
      try {
        this.loading = true
        await this.$auth.loginWith('local', { data: { email: this.email, password: this.password } })
        this.loading = false
        Message({ message: this.$t('login.ok'), type: 'success' })
      } catch (e) {
        Message({ message: this.$t('login.error') + e, type: 'error' })
        this.loading = false
        return
      }
      this.email = this.password = ''
      this.$refs.modal.hide()
    }
  }
}
</script>
