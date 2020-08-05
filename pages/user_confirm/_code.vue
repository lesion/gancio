<template lang="pug">
  v-row.mt-5(align='center' justify='center')
    v-col(cols='12' md="6" lg="5" xl="4")
      v-card
        v-card-title <nuxt-link to='/'><img src='/favicon.ico'/></nuxt-link> {{$t('common.set_password')}}
        template(v-if='valid')
          v-card-text(v-if='valid')
            v-form(v-if='valid')
              v-text-field(type='password' v-model='new_password' :label="$t('common.new_password')")

          v-card-actions
            v-btn(color="success" :disabled='!new_password' @click='change_password') {{$t('common.send')}}

        v-card-text(v-else) {{$t('recover.not_valid_code')}}

</template>
<script>
import { validators } from '../../plugins/helpers'

export default {
  name: 'Recover',
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
    return { validators, new_password: '' }
  },
  methods: {
    async change_password () {
      try {
        await this.$axios.$post('/user/recover_password', { recover_code: this.code, password: this.new_password })
        this.$root.$message({
          type: 'success',
          message: this.$t('common.password_updated')
        })
        this.$router.replace('/login')
      } catch (e) {
        this.$root.$message({
          type: 'warning',
          message: e
        })
      }
    }
  }
}
</script>
