<template lang='pug'>
  el-card

    nuxt-link.float-right(to='/')
      el-button(circle  icon='el-icon-close' type='danger' size='small' plain)
    h5 {{$t('common.register')}}

    el-form(@submit.native.prevent='register' method='POST' action='')
      p(v-html="$t('register.description')")

      el-input.mb-2(v-model='user.username' type='text' name='username'
        :placeholder='$t("common.username")')
        v-icon(name='user' slot='prepend')

      el-input.mb-2(ref='email' v-model='user.email' type='email' required
        :placeholder='$t("common.email")' autocomplete='email' name='email')
        v-icon(name='envelope' slot='prepend')

      el-input.mb-2(v-model='user.password' type="password" placeholder="Password" name='password' required)
        v-icon(name='lock' slot='prepend')

      el-input.mb-2(v-model='user.description' type="textarea" rows='3' :placeholder="$t('common.description')")
          v-icon(name='envelope-open-text')

      el-button(plain type="success" native-type='submit'
        :disabled='disabled') {{$t('common.send')}} <v-icon :name='loading?"circle-notch":"chevron-right"' :spin='loading'/>
</template>

<script>
import { mapActions, mapState } from 'vuex'
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
    ...mapActions(['login']),
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
