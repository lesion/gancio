<template lang='pug'>
  b-modal(hide-footer @hidden='$router.replace("/")' ref='modal'
    :title="$t('Register')" :visible='true' @shown='$refs.email.focus()')
    el-form
      p(v-html="$t('register_explanation')")
      el-input.mb-2(ref='email' v-model='user.email' type='email'
        :placeholder='$t("Email")' autocomplete='email')
        span(slot='prepend') @
      
      el-input.mb-2(v-model='user.password' type="password" placeholder="Password")
        v-icon(name='lock' slot='prepend')

      el-input.mb-2(v-model='user.description' type="textarea" rows='3' :placeholder="$t('Description')")
          v-icon(name='envelope-open-text')

      
      el-button.float-right(plain type="success" icon='el-icon-arrow-right' @click='register') {{$t('Send')}}
</template>

<script>
import api from '~/plugins/api'
import { mapActions } from 'vuex';
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
        const user = await api.register(this.user)
        if (!user.is_admin) {
          this.$refs.modal.hide()
          Message({
            message: this.$t('registration_complete'),
            type: 'success'
          })
        } else {
          Message({
            message: this.$t('admin_registration_complete'),
            type: 'success'
          })
        }
      } catch (e) {
        Message({
          message: e,
          type: 'error'
        })
        console.error(e)
      }
    }
  }
}
</script>
