<template lang="pug">
v-container
  v-row.mt-5(align='center' justify='center')
    v-col(cols='12' md="6" lg="5" xl="4")
      v-card
        v-card-title {{$t('common.set_password')}}
        template(v-if='user')
          v-card-subtitle {{user.email}}
          v-card-text
            v-form
              v-text-field(type='password' v-model='new_password' :label="$t('common.new_password')" :rules='$validators.password' autofocus)

          v-card-actions
            v-spacer
            v-btn(text color="primary" :disabled='!new_password' @click='change_password') {{$t('common.send')}}

        v-card-text(v-else)
          v-alert.ma-5(type='error') {{$t('recover.not_valid_code')}}

</template>
<script>

export default {
  name: 'Recover',
  async asyncData ({ params, $axios }) {
    const code = params.code
    try {
      const user = await $axios.$post('/user/check_recover_code', { recover_code: code })
      return { user, code }
    } catch (e) {
      return { user: false }
    }
  },
  data () {
    return { new_password: '' }
  },
  methods: {
    async change_password () {
      try {
        await this.$axios.$post('/user/recover_password', { recover_code: this.code, password: this.new_password })
        this.$root.$message('common.password_updated', { color: 'success' })
        this.$router.replace('/login')
      } catch (e) {
        this.$root.$message(e, { color: 'warning' })
      }
    }
  }
}
</script>
