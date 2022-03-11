<template lang="pug">
  v-container
    v-card-title.d-block.text-h5.text-center(v-text="$t('setup.completed')")
    v-card-text(v-html="$t('setup.completed_description', user)")
    v-alert.mb-3.mt-1(outlined type='warning' color='red' show-icon :icon='mdiAlert') {{$t('setup.copy_password_dialog')}}
    v-card-actions
      v-btn(text @click='next' color='primary' :loading='loading' :disabled='loading') {{$t('setup.start')}}
        v-icon(v-text='mdiArrowRight')
</template>
<script>
import { mdiArrowRight, mdiAlert } from '@mdi/js'

export default {
  data () {
    return {
      mdiArrowRight, mdiAlert,
      loading: false,
      user: {
        email: 'admin',
        password: ''
      }
    }
  },
  methods: {
    next () {
      window.location='/admin'
    },
    async start (user) {
      this.user = { ...user }
      this.loading = true

      try {
        await this.$axios.$get('/ping')
        this.loading = false
      } catch (e) {
        setTimeout(() => this.start(user), 1000)
      }
    }
  }
}
</script>