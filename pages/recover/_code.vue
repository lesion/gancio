<template lang='pug'>
  v-row.mt-5(align='center' justify='center')
    v-col(cols='12' md="6" lg="5" xl="4")
      v-card
        v-card-title {{settings.title}} - {{$t('common.recover_password')}}
        v-card-text
          div(v-if='valid')
            v-text-field(type='password'
              :rules="$validators.password"
              autofocus :placeholder='$t("common.new_password")'
              v-model='new_password')
          div(v-else) {{$t('recover.not_valid_code')}}

        v-card-actions
          v-spacer
          v-btn(v-if='valid' color='primary' @click='change_password') {{$t('common.send')}}
</template>
<script>
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
        this.$root.$message('common.password_updated')
        this.$router.replace('/login')
      } catch (e) {
        this.$root.$message(e, { color: 'warning' })
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
