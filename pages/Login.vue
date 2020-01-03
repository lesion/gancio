<template lang='pug'>
  el-main
    el-card.mt-5
      h3(slot='header') Login
      p(v-html="$t('login.description')")
      div(v-loading='loading')

        el-input.mb-2(v-model='email' type='email' name='email' prefix-icon='el-icon-user'
          :placeholder='$t("common.email")' autocomplete='email' ref='email')

        el-input.mb-1(v-model='password'  @keyup.enter.native="submit"
          prefix-icon='el-icon-lock' name='password'
          type='password' :placeholder='$t("common.password")')

        div
          el-button.text-right(type='text' @click='forgot') {{$t('login.forgot_password')}}

        el-button.mt-5(plain type="success"
          :disabled='disabled' @click='submit') {{$t('common.login')}}
        el-button(type='primary' plain  href='/?ref=register' v-if='settings.allow_registration') {{$t('login.not_registered')}}
</template>

<script>
import { mapActions, mapState } from 'vuex'
import { Message } from 'element-ui'
import get from 'lodash/get'

export default {
  name: 'Login',
  data () {
    return {
      password: '',
      email: '',
      loading: false
    }
  },
  head () {
    title: 'Login'
  },
  computed: {
    ...mapState(['settings']),
    disabled () {
      return !this.email || !this.password
    }
  },
  methods: {
    ...mapActions(['login']),
    close () {
      this.$router.replace('/')
    },
    async forgot () {
      if (!this.email) {
        Message({ message: this.$t('login.insert_email'), showClose: true, type: 'error' })
        this.$refs.email.focus()
        return
      }
      this.loading = true
      await this.$axios.$post('/user/recover', { email: this.email })
      this.loading = false
      Message({ message: this.$t('login.check_email'), type: 'success' })
    },
    async submit (e) {
      if (this.disabled) { return false }
      e.preventDefault()
      try {
        this.loading = true
        await this.$auth.loginWith('local', { data: { email: this.email, password: this.password } })
        const user = await this.$axios.$get('/auth/user')
        this.$auth.setUser(user)
        this.loading = false
        Message({ message: this.$t('login.ok'), showClose: true, type: 'success' })
        this.close()
      } catch (e) {
        e = get(e, 'response.data.message', e)
        Message({ message: this.$t('login.error') + this.$t(e), showClose: true, type: 'error' })
        this.loading = false
        return
      }
      this.email = this.password = ''
    }
  }
}
</script>
