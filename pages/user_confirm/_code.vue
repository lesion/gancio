<template lang="pug">
  el-main
    h4 <nuxt-link to='/'><img src='/favicon.ico'/></nuxt-link> {{$t('common.set_password')}}

    div(v-if='valid')
      el-form
        el-form-item {{$t('common.new_password')}}
          el-input(type='password', v-model='new_password')
        el-button(plain type="success" icon='el-icon-send'
          :disabled='!new_password' @click='change_password') {{$t('common.send')}}

    div(v-else) {{$t('recover.not_valid_code')}}

</template>
<script>
import { Message } from 'element-ui'

export default {
  name: 'Recover',
  data () {
    return { new_password: '' }
  },
  async asyncData ({ params, $axios }) {
    const code = params.code
    try {
      const valid = await $axios.$post('/user/check_recover_code', { recover_code: code })
      return { valid, code }
    } catch (e) {
      return { valid: false }
    }
  },
  methods: {
    async change_password () {
      try {
        const res = await this.$axios.$post('/user/recover_password', { recover_code: this.code, password: this.new_password })
        Message({
          showClose: true,
          type: 'success',
          message: this.$t('common.password_updated')
        })
        this.$router.replace('/?ref=login')
      } catch (e) {
        Message({
          showClose: true,
          type: 'warning',
          message: e
        })
      }
    }
  }
}
</script>
