<template lang='pug'>
  el-main
    el-card
      h4(slot='header').text-center <el-icon name='user'/> {{$t('common.register')}}
      p(v-html="$t('register.description')")
      div(v-loading='loading')

        el-input.mb-2(ref='email' v-model='user.email' type='email' required
          :placeholder='$t("common.email")' autocomplete='email'
          prefix-icon='el-icon-message' name='email')

        el-input.mb-2(v-model='user.password' type="password"
          placeholder="Password" name='password' required  prefix-icon='el-icon-lock')

        el-input.mb-2(v-model='user.description' type="textarea" rows='3' :placeholder="$t('common.description')")

        el-button(plain type="success" :disabled='disabled' @click='register') {{$t('common.send')}} <v-icon name='chevron-right'/>
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
    close () {
      this.$router.replace('/')
    },
    async register () {
      this.loading = true
      try {
        const { user } = await this.$axios.$post('/user/register', this.user)
        Message({
          showClose: true,
          message: this.$t(`register.${user.is_admin ? 'admin_' : ''}complete`),
          type: 'success'
        })
        this.close()
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
