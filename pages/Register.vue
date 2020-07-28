<template lang='pug'>
  v-row.mt-5(align='center' justify='center')
    v-col(cols='12' sm='10' md="6")

      v-card
        v-card-title {{$t('common.register')}}

        v-card-text

          p(v-html="$t('register.description')")
          v-form(ref='form')
            v-text-field(ref='email'
              v-model='user.email' type='email'
              :rules="validators.email"
              :label='$t("common.email")' autocomplete='email')

            v-text-field(v-model='user.password' type="password"
              :rules="validators.password"
              :label="$t('common.password')")

            v-textarea(v-model='user.description'
              :rules="[validators.required('description')]"
              :label="$t('common.description')")

        v-card-actions
          v-btn(@click='register' color='primary') {{$t('common.send')}}
            v-icon mdi-chevron-right
</template>

<script>
import { mapState } from 'vuex'
import get from 'lodash/get'
import { validators } from '../plugins/helpers'

export default {
  name: 'Register',
  data () {
    return {
      validators,
      loading: false,
      user: {}
    }
  },
  // https://nuxtjs.org/api/pages-validate/
  // If the validate method does not return true, Nuxt.js will automatically load the 404 error page.
  validate ({ store }) {
    return store.state.settings.allow_registration
  },
  computed: {
    ...mapState(['settings']),
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
        this.$root.$message({
          message: first_user ? this.$t('register.first_user') : this.$t('register.complete')
        })
        this.$router.replace('/')
      } catch (e) {
        const error = get(e, 'response.data.errors[0].message', String(e))
        this.$root.$message({ message: this.$t(error), color: 'error' })
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
