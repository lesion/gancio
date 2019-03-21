<template lang='pug'>
  b-modal(@shown="$refs.password.focus()" :title='$t("Password reset")' hide-footer
    @hidden='$router.replace("/")' :visible='true' ref='modal')
    div(v-loading='loading')
      p(v-html="$t('recover_explanation')")
      span(v-if='user.email') {{user.email}}
      el-input.mb-2(v-model='password' type='password' :placeholder='$t("New password")' ref='password')
        v-icon(name='lock' slot='prepend')
      el-button.mr-1(plain type="success" @click='change') {{$t('Change')}}
</template>

<script>
import api from '@/api'
import { mapActions } from 'vuex'
import { Message } from 'element-ui'


export default {
  name: 'Recover',
  data () {
    return {
      password: '',
      loading: true,
      user: {}
    }
  },
  async mounted () {
    try {
      this.user = await api.checkRecoverCode(this.$route.params.recover_code)
      console.log(this.user)
    } catch (e) {
      this.$refs.modal.hide()
      Message({message: this.$t('error_recover_code'), type: 'error'})
    }
    this.loading = false

  },
  methods: {
    async change () {
      if (!this.password) return
      this.loading = true
      try {
        await api.recoverPassword(this.$route.params.recover_code, this.password)
      } catch (e) {
        this.loading = false
        Message({ message: this.$t('password_not_changed'), type: 'error'})
        return
      }
      this.loading = false
      // this.$refs.modal.hide()
      Message({ message: this.$t('password_changed'), type: 'success'})
      this.$router.replace('/login')
    }
  }
}
</script>
