<template lang='pug'>
  v-row.mt-5(align='center' justify='center')
    v-col(cols='12' sm='10' md="6")

      v-card
        v-card-title {{$t('common.register')}}

        v-card-text

          p(v-html="$t('register.description')")
          v-text-field(ref='email' v-model='user.email' type='email' required
            :placeholder='$t("common.email")' autocomplete='email'
            prefix-icon='el-icon-message')

          v-text-field(v-model='user.password' type="password"
            placeholder="Password")

          v-text-field(v-model='user.description' textarea rows='3' :placeholder="$t('common.description')")

        v-card-actions
          v-btn(plain type="success" :disabled='disabled' @click='register') {{$t('common.send')}} <v-icon name='chevron-right'/>
</template>

<script>
import { mapState } from 'vuex'
import { Message } from 'element-ui'
import get from 'lodash/get'

export default {
  name: 'Register',
  data () {
    return {
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
    disabled () {
      if (process.server) { return false }
      return !this.user.password || !this.user.email || !this.user.description
    }
  },
  mounted () {
    this.$refs.email.focus()
  },
  methods: {
    async register () {
      try {
        this.loading = true
        const user = await this.$axios.$post('/user/register', this.user)
        // this is the first user registered
        const first_user = user && user.is_admin && user.is_active
        Message({
          showClose: true,
          message: first_user ? this.$t('register.first_user') : this.$t('register.complete'),
          type: 'success'
        })
        this.$router.replace('/')
      } catch (e) {
        const error = get(e, 'response.data.errors[0].message', String(e))
        Message({
          showClose: true,
          message: this.$t(error),
          type: 'error'
        })
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
