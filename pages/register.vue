<template lang='pug'>
  b-modal(hide-footer @hidden='$router.replace("/")' ref='modal'
    :title="$t('common.register')" :visible='true' @shown='$refs.email.focus()')
    el-form
      p(v-html="$t('register.description')")
      el-input.mb-2(ref='email' v-model='user.email' type='email'
        :placeholder='$t("common.email")' autocomplete='email')
        span(slot='prepend') @

      el-input.mb-2(v-model='user.password' type="password" placeholder="Password")
        v-icon(name='lock' slot='prepend')

      el-input.mb-2(v-model='user.description' type="textarea" rows='3' :placeholder="$t('common.description')")
          v-icon(name='envelope-open-text')

      el-button.float-right(plain type="success" icon='el-icon-arrow-right' @click='register') {{$t('common.send')}}
</template>

<script>
import api from '@/plugins/api'
import { mapActions } from 'vuex'
import { Message } from 'element-ui'

export default {
  name: 'Register',
  data () {
    return {
      error: {},
      user: { }
    }
  },
  methods: {
    ...mapActions(['login']),
    async register () {
      try {
        const user = await this.$axios.$post('/user', this.user)
        this.$refs.modal.hide()
        Message({
          message: this.$t(`register.${user.is_admin && 'admin_'}complete`),
          type: 'success'
        })
      } catch (e) {
        Message({
          message: this.$t('register.error') + e,
          type: 'error'
        })
        console.error(e)
      }
    }
  }
}
</script>
