<template lang='pug'>
  el-card.mt-5
    h4(slot='header')
      nuxt-link(to='/')
        img(src='/favicon.ico')
      span  {{settings.title}} - {{$t('common.authorize')}}
    div(v-if='valid')
      el-input(type='password', :placeholder='$t("common.new_password")' v-model='new_password' prefix-icon='el-icon-lock')
    div(v-else) {{$t('recover.not_valid_code')}}

    el-button.mt-2(plain v-if='valid' type="success" icon='el-icon-check'
      @click='change_password') {{$t('common.send')}}
</template>
<script>
import { Message } from 'element-ui'
import { mapState } from 'vuex'

export default {
  name: 'Recover',
  layout: 'modal',
  async asyncData ({ params, $axios }) {
    const code = params.code
    try {
      const valid = await $axios.$post('/user/check_recover_code', { recover_code: code })
      return { valid, code }
    } catch (e) {
      return { valid: false }
    }
  },
  data () {
    return { new_password: '' }
  },
  computed: mapState(['settings']),
  methods: {
    async change_password () {
      try {
        await this.$axios.$post('/user/recover_password', { recover_code: this.code, password: this.new_password })
        Message({
          showClose: true,
          type: 'success',
          message: this.$t('common.password_updated')
        })
        this.$router.replace('/login')
      } catch (e) {
        Message({
          showClose: true,
          type: 'warning',
          message: e
        })
      }
    }
  },
  head () {
    return { title: `${this.settings.title} - Authorize` }
  }
}
</script>
<style lang='less'>
  h4 img {
    max-height: 40px;
    border-radius: 20px;
    background-color: #333;
    border: 1px solid #333;
  }
</style>
