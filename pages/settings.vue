<template lang="pug">
  el-card
    nuxt-link.float-right(to='/')
      el-button
        v-icon(name='times' color='red')
    h5 {{$t('common.settings')}}

    el-form(action='/api/user' method='PUT' @submit.native.prevent='change')
      el-form-item {{$t('settings.change_password')}}
        el-input(v-model='password' type='password')
      el-button(type='success' native-type='submit') {{$t('common.send')}}
</template>
<script>
import { mapState, mapActions } from 'vuex'
import { Message } from 'element-ui'

export default {
  data () {
    return {
      password: '',
    }
  },
  // async asyncData ({ $axios, params }) {
  //   const user = await $axios.$get('/auth/user')
  //   user.mastodon_auth = ''
  //   return { user }
  // },
  methods: {
    async change () {
      if (!this.password) return
      const user_data = { id : this.$auth.user.id, password: this.password }
      try {
        const user = await this.$axios.$put('/user', user_data)
        Message({ message: this.$t('settings.password_updated'), type: 'success' })
        this.$router.replace('/')
      } catch (e) {
        console.log(e)
      }
    },
  }
}
</script>

