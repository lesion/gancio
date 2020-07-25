<template lang='pug'>
  v-row.mt-5(align='center' justify='center')
    v-col(cols='12' md="6" lg="5" xl="4")

      v-card
        v-card-title {{$t('common.login')}}
        v-card-subtitle(v-text="$t('login.description')")

        v-card-text

          v-text-field(v-model='email' type='email'
            :placeholder='$t("common.email")'
            ref='email')

          v-text-field(v-model='password'
            type='password'
            :placeholder='$t("common.password")')

          v-card-actions
            v-btn(color='success'
              text
              :disabled='disabled'
              @click='submit') {{$t('common.login')}}

            v-btn(v-if='settings.allow_registration'
              to='/register'
              text
              color='orange') {{$t('login.not_registered')}}

            v-btn(text @click='forgot') {{$t('login.forgot_password')}}
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
