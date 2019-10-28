<template lang='pug'>
  el-dialog(:visible='show' @close='close' :close-on-click-modal='false'
    append-to-body :title="$t('common.register')")

    p(v-html="$t('register.description')")
    div(v-loading='loading')

      el-input.mb-2(v-model='user.username' type='text' name='username'
        :placeholder='$t("common.username")' prefix-icon='el-icon-user')

      el-input.mb-2(ref='email' v-model='user.email' type='email' required
        :placeholder='$t("common.email")' autocomplete='email'
        prefix-icon='el-icon-message' name='email')

      el-input.mb-2(v-model='user.password' type="password"
        placeholder="Password" name='password' required  prefix-icon='el-icon-lock')

      el-input.mb-2(v-model='user.description' type="textarea" rows='3' :placeholder="$t('common.description')")

    span(slot='footer')
      el-button(plain type="success" :disabled='disabled' @click='register') {{$t('common.send')}} <v-icon name='chevron-right'/>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import { Message } from 'element-ui'
import get from 'lodash/get'

export default {
  name: 'Register',
  props: ['show'],
  data () {
    return {
      loading: false,
      user: {}
    }
  },
  head () {
    return {
      title: this.settings.title + ' - ' + this.$t('common.register')
    }
  },
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
  methods: {
    close () {
      this.$router.replace('/')
      this.$emit('close')
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
  }
}
</script>
