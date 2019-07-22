<template lang="pug">
  el-card
    nuxt-link.float-right(to='/')
      el-button(circle  icon='el-icon-close' type='danger' size='small' plain)

    h5 <img src='/favicon.ico'/> {{$t('common.activate_user')}}
    div(v-if='valid')
      el-form
        el-form-item {{$t('common.password')}}
          el-input(type='password', v-model='new_password')
        el-button(plain type="success" icon='el-icon-send', @click='change_password') {{$t('common.send')}}

    div(v-else) {{$t('recover.not_valid_code')}}
      
    
</template>
<script>
import { Message } from 'element-ui'

export default {
  name: 'Recover',
  data () {
    return { new_password: '' }
  },
  async asyncData({ params, $axios }) {
    const code = params.code
    try {
      const valid = await $axios.$post('/user/check_recover_code', { recover_code: code })
      return { valid, code }
    }
    catch (e) {
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
        this.$router.replace('/login')
      } catch(e) {
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


