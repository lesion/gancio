<template lang='pug'>
  el-main
    el-card
      h4(slot='header').text-center <el-icon name='user'/> {{$t('common.login')}}
      p(v-html="$t('login.description')")
      div(v-loading='loading')

        el-input.mb-2(v-model='email' type='email' title='email' prefix-icon='el-icon-user'
          :placeholder='$t("common.email")' autocomplete='email' ref='email')

        el-input.mb-1(v-model='password' @keyup.enter.native="submit"
          prefix-icon='el-icon-lock' name='password'
          type='password' :placeholder='$t("common.password")')

        div
          el-button.text-right(type='text' @click='forgot') {{$t('login.forgot_password')}}

        el-button.mt-5.mr-1(plain type="success"
          :disabled='disabled' @click='submit') {{$t('common.login')}}
        nuxt-link(to='/register' v-if='settings.allow_registration')
          el-button(type='primary' plain) {{$t('login.not_registered')}}
</template>

<script>
import { mapState } from 'vuex'
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
  computed: {
    ...mapState(['settings']),
    disabled () {
      return !this.email || !this.password
    }
  },
  mounted () {
    this.$refs.email.focus()
  },
  methods: {
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
        const data = new URLSearchParams()
        data.append('username', this.email)
        data.append('password', this.password)
        data.append('grant_type', 'password')
        data.append('client_id', 'self')
        await this.$auth.loginWith('local', { data })
        this.loading = false
        Message({ message: this.$t('login.ok'), showClose: true, type: 'success' })
        this.$router.replace('/')
      } catch (e) {
        Message({ message: this.$t('login.error'), showClose: true, type: 'error' })
        this.loading = false
        return
      }
      this.email = this.password = ''
    }
  },
  head () {
    return {
      title: this.settings.title + ' - ' + this.$t('common.login')
    }
  }
}
</script>
