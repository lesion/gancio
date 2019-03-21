<template lang='pug'>
  b-modal(@shown="$refs.email.focus()" :title='$t("Login")' hide-footer
    @hidden='$router.replace("/")' :visible='true' ref='modal')
    el-form(v-loading='loading')
      p(v-html="$t('login_explanation')")
      el-input.mb-2(v-model='email' type='email' :placeholder='$t("Email")' autocomplete='email' ref='email')
        v-icon(name='user' slot='prepend')
      el-input.mb-1(v-model='password'  @keyup.enter.native="submit" type='password' :placeholder='$t("Password")')
        v-icon(name="lock" slot='prepend')
      el-button.mr-1(plain type="success" @click='submit') {{$t('Login')}}
      router-link(to='/register')
        el-button.mt-1(plain type="primary") {{$t('Not registered?')}}
      a.float-right(href='#' @click='forgot') {{$t('Forgot password?')}}
</template>

<script>
import api from '@/api'
import { mapActions } from 'vuex'
import { Message } from 'element-ui'


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
        Message({ message: this.$t('Insert your email'), type: 'error' })
        this.$refs.email.focus()
        return
      }
      this.loading = true
      await api.forgotPassword(this.email)
      this.loading = false
      Message({ message: this.$t('Check your email!'), type: 'success' })
    },
    async submit (e) {
      e.preventDefault()
      try {
        this.loading = true
        const user = await api.login(this.email, this.password)
        this.loading = false
        if (!user) {
          Message({ message: this.$t('Login error'), type: 'error' })
          return;
        }
        this.login(user)
        Message({ message: this.$t('Logged'), type: 'success' })
      } catch (e) {
        Message({ message: this.$t('Login error'), type: 'error' })
        this.loading = false
        return
      }
      this.email = this.password = ''
      this.$refs.modal.hide()
    }
  }
}
</script>
