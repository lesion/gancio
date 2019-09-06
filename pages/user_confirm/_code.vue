<template lang="pug">
  el-card
    nuxt-link.float-right(to='/')
      el-button(circle  icon='el-icon-close' type='danger' size='small' plain)

    h5 <img src='/favicon.ico'/> {{$t('confirm.title')}}
    p(v-if='valid' v-html='$t("confirm.valid")')
    p(v-else) {{$t('confirm.not_valid')}}
    
</template>
<script>
import { Message } from 'element-ui'

export default {
  name: 'Confirm',
  data () {
    return { valid: true }
  },
  async asyncData({ params, $axios }) {
    const recover_code = params.code
    try {
      const valid = await $axios.$post('/user/check_recover_code', { recover_code })
      return { valid }
    } catch (e) {
      return { valid: false }
    }
  }
}
</script>


