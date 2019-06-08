<template lang="pug">
  el-card
    nuxt-link.float-right(to='/')
      v-icon(name='times' color='red')
    h5 {{$t('common.settings')}}

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
      // this.$auth.user.password = this.password
      const user_data = { id : this.$auth.user.id, password: this.password }
      try {
        const user = await this.$axios.$put('/user', user_data)
        console.error(user)
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

