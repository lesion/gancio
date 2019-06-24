<template lang="pug">
  el-card
    nuxt-link.float-right(to='/')
      v-icon(name='times' color='red')
    h5 {{$t('common.settings')}}

    el-form(action='/api/user' method='PUT' @submit.native.prevent='change_password')
      el-form-item {{$t('settings.change_password')}}
        el-input(v-model='password' type='password')
      el-button(type='success' native-type='submit') {{$t('common.send')}}
    
    el-divider {{$t('settings.danger_section')}}
    p {{$t('settings.remove_account')}}
    el-button(type='danger' @click='remove_account') {{$t('common.remove')}}
</template>
<script>
import { mapState, mapActions } from 'vuex'
import { Message, MessageBox } from 'element-ui'

export default {
  data () {
    return {
      password: '',
    }
  },
  async asyncData ({ $axios, params }) {
    const user = await $axios.$get('/auth/user')
    user.mastodon_auth = ''
    return { user }
  },
  methods: {
    async change_password () {
      if (!this.password) return
      const user_data = { id : this.$auth.user.id, password: this.password }
      try {
        const user = await this.$axios.$put('/user', user_data)
        Message({ message: this.$t('settings.password_updated'), showClose: true, type: 'success' })
        this.$router.replace('/')
      } catch (e) {
        console.log(e)
      }
    },
    async remove_account () {
      MessageBox.confirm(this.$t('settings.remove_account_confirm'), this.$t('common.confirm'), {
        confirmButtonText: this.$t('common.ok'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'error'
      }).then( () => {
        this.$axios.$delete('/user')
      })
    }
  }
}
</script>

