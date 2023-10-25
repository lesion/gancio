<template lang="pug">
v-container
  v-row.mt-5(align='center' justify='center')
    v-col(cols='12' md="6" lg="5" xl="4")
      v-form(ref='form' @submit.prevent='change_password')
        v-card
          v-card-title {{$t('common.set_password')}}
          template(v-if='user')
            v-card-subtitle {{user.email}}
            v-card-text
              v-text-field(type='password' v-model='new_password' :label="$t('common.new_password')" :rules='$validators.password' autofocus)

            v-card-actions
              v-spacer
              v-btn(color="primary" type='submit' :disabled='!new_password' @click='change_password' outlined) {{$t('common.send')}}

          v-card-text(v-else)
            v-alert.ma-5(type='error' :icon='mdiAlert') {{$t('recover.not_valid_code')}} <br/> {{ error }}

</template>
<script>
import { mdiAlert } from '@mdi/js'

export default {
  name: 'Recover',
  async asyncData ({ params, $axios }) {
    const code = params.code
    try {
      const user = await $axios.$post('/user/check_recover_code', { recover_code: code })
      return { user, code }
    } catch (e) {
      return { user: false, error: String(e) }
    }
  },
  data () {
    return { new_password: '', mdiAlert }
  },
  methods: {
    async change_password () {
      if (!this.$refs.form.validate()) return
      try {
        await this.$axios.$post('/user/recover_password', { recover_code: this.code, password: this.new_password })
        this.$root.$message('common.password_updated', { color: 'success' })
        this.$router.push('/login')
      } catch (e) {
        this.$root.$message(e, { color: 'warning' })
      }
    }
  }
}
</script>
