<template lang='pug'>
  el-card
    nuxt-link.float-right(to='/')
      el-button(circle  icon='el-icon-close' type='danger' size='small' plain)

    h5 {{$t('common.login')}}
    el-form(v-loading='loading')
      p(v-html="$t('login.description')")

      el-input.mb-2(v-model='email' type='email' name='email'
        :placeholder='$t("common.email")' autocomplete='email' ref='email')
        v-icon(name='envelope' slot='prepend')

      el-input.mb-1(v-model='password'  @keyup.enter.native="submit" name='password'
        type='password' :placeholder='$t("common.password")')
        v-icon(name='lock' slot='prepend')

      el-button.mr-1(plain type="success"
        :disabled='disabled' @click='submit') {{$t('common.login')}}

      nuxt-link(to='/register' v-if='settings.allow_registration')
        el-button.mt-1(plain type="primary") {{$t('login.not_registered')}}

      a.float-right(href='#' @click='forgot') {{$t('login.forgot_password')}}
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
  computed: {
    ...mapState(['settings']),
    disabled () {
      if (process.server) return false
      return !this.email || !this.password
    }
  },
  methods: {
    ...mapActions(['login']),
    async forgot () {
      if (!this.email) {
        Message({ message: this.$t('login.insert_email'), showClose:true, type: 'error' })
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
        Message({ message: this.$t('login.ok'), showClose: true, type: 'success' })
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
