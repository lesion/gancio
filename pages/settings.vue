<template lang="pug">
  el-dialog(:title="$t('common.settings')" :before-close='close' visible)
    //- el-form
      //- el-form-item {{$t('settings.change_password')}}
    el-divider {{$t('settings.change_password')}}
    el-input(v-model='password' type='password')
      el-button(slot='append' @click='change' type='success') {{$t('common.send')}}
</template>
<script>
import { mapState, mapActions } from 'vuex'
export default {
  data () {
    return {
      password: '',
    }
  },
  // computed: mapState(['user']),
  // async asyncData ({ $axios, params }) {
  //   const user = await $axios.$get('/auth/user')
  //   user.mastodon_auth = ''
  //   return { user }
  // },
  methods: {
    async change () {
      if (!this.password) return
      const user = this.user
      user.password = this.password
      try {
        // this.$axios.
        // await api.updateUser(user)
      } catch (e) {
        console.log(e)
      }
    },
    close (done) {
      this.$router.back()
      done()
    }
  }
}
</script>

