<template lang='pug'>
v-container
  v-row.mt-5(align='center' justify='center')
    v-col(cols='12' md="6" lg="5" xl="4")

      v-card
        v-card-title {{$t('common.register')}}

        v-card-text

          p(v-html="$t('register.description')")
          v-form(ref='form' v-model='valid')
            v-text-field(ref='email'
              v-model='user.email' type='email'
              :rules="$validators.email"
              :label='$t("common.email")' autocomplete='email')

            v-text-field(v-model='user.password' type="password"
              :rules="$validators.password"
              :label="$t('common.password')")

            v-textarea(v-model='user.description'
              :rules="[$validators.required($t('common.description'))]"
              :label="$t('common.description')")

        v-card-actions
          v-spacer
          v-btn(@click='register'
            :disabled='!valid || loading' :loading='loading'
            color='primary') {{$t('common.send')}}
            v-icon mdi-chevron-right
</template>

<script>
import { mapState } from 'vuex'
import get from 'lodash/get'

export default {
  name: 'Register',
  data () {
    return {
      loading: false,
      user: {},
      valid: true
    }
  },
  // https://nuxtjs.org/api/pages-validate/
  // If the validate method does not return true, Nuxt.js will automatically load the 404 error page.
  validate ({ store }) {
    return store.state.settings.allow_registration
  },
  computed: {
    ...mapState(['settings'])
    // disabled () {
    //   if (process.server) { return false }
    //   return !this.user.password || !this.user.email || !this.user.description
    // }
  },
  mounted () {
    this.$refs.email.focus()
  },
  methods: {
    async register () {
      const valid = this.$refs.form.validate()
      if (!valid) { return }
      try {
        this.loading = true
        const user = await this.$axios.$post('/user/register', this.user)
        // this is the first user registered
        const first_user = user && user.is_admin && user.is_active
        this.$root.$message(first_user ? 'register.first_user': 'register.complete')
        this.$router.replace('/')
      } catch (e) {
        const error = get(e, 'response.data.errors[0].message', String(e))
        this.$root.$message(error, { color: 'error' })
      }
      this.loading = false
    }
  },
  head () {
    return {
      title: this.settings.title + ' - ' + this.$t('common.register')
    }
  }
}
</script>
