<template lang='pug'>

  el-dialog(:title='$t("common.login")' :before-close='close' visible)

    el-form(v-loading='loading')
      p(v-html="$t('login.description')")

      el-input.mb-2(v-model='email' type='email' :placeholder='$t("common.email")' autocomplete='email' ref='email')
        i.el-icon-user(slot='prepend')

      el-input.mb-1(v-model='password'  @keyup.enter.native="submit" type='password' :placeholder='$t("common.password")')
        i.el-icon-lock(slot='prepend')

      el-button.mr-1(plain type="success" :disabled='!email || !password' @click='submit') {{$t('common.login')}}

      nuxt-link(to='/register')
        el-button.mt-1(plain type="primary") {{$t('login.not_registered')}}

      a.float-right(href='#' @click='forgot') {{$t('login.forgot_password')}}
</template>

<script>
const Cookie = process.client ? require('js-cookie') : undefined
import { mapActions } from 'vuex'
import { Message } from 'element-ui'
import get from 'lodash/get'

export default {
  name: 'Login',
  data () {
    return {
      open: true,
      password: '',
      email: '',
      loading: false
    }
  },
  methods: {
    close () {
      this.$router.replace('/')
    },
    ...mapActions(['login']),
    async forgot () {
      if (!this.email) {
        Message({ message: this.$t('login.insert_email'), type: 'error' })
        this.$refs.email.focus()
        return
      }
      this.loading = true
      await this.$axios.$post('/user/recover', { email: this.email })
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
        e = get(e, 'response.data.message', e)
        Message({ message: this.$t('login.error') + this.$t(e), type: 'error' })
        this.loading = false
        return
      }
      this.email = this.password = ''
    }
  }
}
</script>
