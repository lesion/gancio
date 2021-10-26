<template lang="pug">
  v-card
    v-card-title SMTP Email configuration
    v-card-text
      p(v-html="$t('admin.smtp_description')")

      v-form(v-model='isValid')
        v-text-field(v-model='admin_email'
          @blur="save('admin_email', admin_email )"
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
      v-btn(color='primary' @click='testSMTP' :loading='loading' :disabled='loading || !isValid') {{$t('admin.smtp_test_button')}}
      v-btn(color='warning' @click="done") {{$t("common.ok")}}
  
</template>
<script>
import { mapActions, mapState } from 'vuex'
export default {
  data ({ $store }) {
    const smtp = { host: '', auth: { user: '', pass: '' } }
    if ($store.state.settings.smtp) {
      smtp.host = $store.state.settings.smtp.host
      if ($store.state.settings.smtp.auth) {
        smtp.auth.user = $store.state.settings.smtp.auth.user
        smtp.auth.pass = $store.state.settings.smtp.auth.pass
      }
    }
    return {
      isValid: false,
      loading: false,
      smtp,
      admin_email: $store.state.settings.admin_email || ''
    }
  },
  computed: mapState(['settings']),
  methods: {
    ...mapActions(['setSetting']),
    async testSMTP () {
      this.loading = true
      try {
        this.setSetting({ key: 'smtp', value: this.smtp })
        await this.$axios.$post('/settings/smtp', { smtp: this.smtp })
        this.$root.$message(this.$t('admin.smtp_test_success', { admin_email: this.admin_email }), { color: 'success' })
      } catch (e) {
        console.error(e)
        this.$root.$message(e.response && e.response.data, { color: 'error' })
      }
      this.loading = false
    },
    save (key, value) {
      if (this.settings[key] !== value) {
        this.setSetting({ key, value })
      }
    },    
    done () {
      this.setSetting({ key: 'smtp', value: JSON.parse(JSON.stringify(this.smtp)) })
      this.$emit('close')
    },

  }
}
</script>