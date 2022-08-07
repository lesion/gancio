<template lang="pug">
v-container
  v-card
    v-card-title.text-h5 {{$auth.user.email}}
    v-card-text
      p {{$t('settings.remove_account')}}
      v-btn.black--text(color='warning' @click='remove_account') {{$t('common.remove')}}
</template>
<script>
import { mapState } from 'vuex'

export default {
  name: 'Settings',
  middleware: ['auth'],
  data () {
    return {
      password: '',
      user: { }
    }
  },
  computed: mapState(['settings']),
  methods: {
    // async change_password () {
    //   if (!this.password) { return }
    //   const user_data = { id: this.$auth.user.id, password: this.password }
    //   try {
    //     await this.$axios.$put('/user', user_data)
    //     Message({ message: this.$t('settings.password_updated'), showClose: true, type: 'success' })
    //     this.$router.replace('/')
    //   } catch (e) {
    //     console.log(e)
    //   }
    // },
    // update_settings () {
    //   MessageBox.confirm(this.$t('settings.update_confirm'),
    //     this.$t('common.confirm'), {
    //       confirmButtonText: this.$t('common.ok'),
    //       cancelButtonText: this.$t('common.cancel'),
    //       type: 'error'
    //     }).then(async () => {
    //     this.user = await this.$axios.$put('/user', { ...this.user, password: this.password })
    //   }).catch(e => {
    //     Message({ message: e, showClose: true, type: 'warning' })
    //   })
    // },
    async remove_account () {
      const ret = await this.$root.$confirm('settings.remove_account_confirm', { color: 'error' })
      if (!ret) return
      this.$axios.$delete('/user')
      this.$auth.logout()
      this.$router.replace('/')
    }
  },
  head () {
    return {
      title: `${this.settings.title} - ${this.$t('common.settings')}`
    }
  }
}
</script>
