<template lang='pug'>
  v-container.pa-0.pa-md-3
    v-row.mt-md-5.ma-0(align='center' justify='center')
      v-col.pa-0.pa-md-3(cols='12' md="6" lg="5" xl="4")
        v-form(v-model='valid' ref='form' lazy-validation @submit.prevent='submit')
          v-card
            v-card-title {{$t('common.login')}}
            v-card-subtitle(v-text="$t('login.description')")

            v-card-text
                v-text-field(v-model='email' type='email'
                  validate-on-blur
                  :rules='$validators.email' autofocus
                  :label='$t("common.email")'
                  ref='email')

                v-text-field(v-model='password'
                  :rules='$validators.password'
                  type='password'
                  :label='$t("common.password")')

            v-card-actions
              v-btn(text
                tabindex="1"
                @click='forgot' small) {{$t('login.forgot_password')}}

            v-card-actions
              v-spacer

              v-btn(v-if='settings.allow_registration'
                to='/register'
                text
                color='orange') {{$t('login.not_registered')}}

              v-btn(color='success'
                type='submit' outlined
                :disabled='!valid || loading' :loading='loading') {{$t('common.login')}}

</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'Login',
  data () {
    return {
      password: '',
      email: '',
      loading: false,
      valid: false
    }
  },
  computed: {
    ...mapState(['settings'])
  },
  methods: {
    async forgot () {
      if (!this.email) {
        this.$refs.email.focus()
        return
      }
      this.loading = true
      await this.$axios.$post('/user/recover', { email: this.email })
      this.loading = false
      this.$root.$message('login.check_email', { color: 'success' })
    },
    async submit (e) {
      if (!this.$refs.form.validate()) return
      try {
        this.loading = true
        const data = new URLSearchParams()
        data.append('username', this.email)
        data.append('password', this.password)
        data.append('grant_type', 'password')
        data.append('client_id', 'self')
        await this.$auth.loginWith('local', { data })
        this.loading = false
        this.$root.$message('login.ok',{ color: 'success' })
      } catch (e) {
        this.$root.$message('login.error',{ color: 'error' })
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
