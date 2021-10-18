<template lang="pug">
  v-card
    v-card-title SMTP Email configuration
    v-card-text
      p(v-html="$t('admin.smtp_description')")

      v-text-field(v-model='admin_email'
        :label="$t('admin.admin_email')"
        :rules="$validators.email")

      v-text-field(v-model='smtp.host'
        :label="$t('admin.smtp_hostname')"
        :rules="[$validators.required('admin.smtp_hostname')]")

      v-text-field(v-model='smtp.auth.user'
        :label="$t('common.user')"
        :rules="[$validators.required('common.user')]")

      v-text-field(v-model='smtp.auth.pass'
        :label="$t('common.password')"
        :rules="[$validators.required('common.password')]"
        type='password')

    v-card-actions
      v-spacer
      v-btn(color='primary' @click='testSMTP' :loading='loading' :disabled='loading') {{$t('admin.smtp_test_button')}}
      v-btn(color='warning' @click="done") {{$t("common.ok")}}
  
</template>
<script>
import { mapActions, mapState } from 'vuex'
export default {
  data () {
    return {
      loading: false,
      smtp: { host: '', auth: {} }
    }
  },
  computed: {
    ...mapState(['settings']),
    admin_email: {
      get () { return this.settings.admin_email },
      set (value) { this.setSetting({ key: 'admin_email', value }) }
    },
  },
  mounted () {
    this.smtp.auth.user = this.settings.smtp.auth.user
    this.smtp.auth.pass = this.settings.smtp.auth.pass
    this.smtp.host = this.settings.smtp.host
  },
  methods: {
    ...mapActions(['setSetting']),
    async testSMTP () {
      this.loading = true
      try {
        await this.$axios.$post('/settings/smtp', { smtp: this.smtp })
        this.$root.$message(this.$t('admin.smtp_test_success', { admin_email: this.admin_email }), { color: 'success' })
      } catch (e) {
        console.error(e)
        this.$root.$message(e.response && e.response.data, { color: 'error' })
      }
      this.loading = false
    },
    done () {
      this.$emit('close')
      this.setSetting({ key: 'smtp', value: this.smtp })
    },

  }
}
</script>