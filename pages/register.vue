<template lang='pug'>
  el-dialog(:title="$t('common.register')" visible :before-close='() => $router.replace("/")' @open='$refs.email.focus()')
    el-form
      p(v-html="$t('register.description')")
      el-input.mb-2(ref='email' v-model='user.email' type='email' required
        :placeholder='$t("common.email")' autocomplete='email')
        span(slot='prepend') @

      el-input.mb-2(v-model='user.password' type="password" placeholder="Password")
        v-icon(name='lock' slot='prepend')

      el-input.mb-2(v-model='user.description' type="textarea" rows='3' :placeholder="$t('common.description')")
          v-icon(name='envelope-open-text')

      el-button(plain type="success" icon='el-icon-arrow-right' :disabled='!user.password || !user.email || !user.description' @click='register') {{$t('common.send')}}
</template>

<script>
import { mapActions } from 'vuex'
import { Message } from 'element-ui'

export default {
  name: 'Register',
  data () {
    return {
      error: {},
      user: { }
    }
  },
  computed: {
    
  },
  methods: {
    ...mapActions(['login']),
    async register () {
      try {
        const user = await this.$axios.$post('/user', this.user)
        Message({
          message: this.$t(`register.${user.is_admin && 'admin_'}complete`),
          type: 'success'
        })
        this.$router.replace("/")
      } catch (e) {
        console.log('DENTRO CATCH!!!', e)
        const error = e && e.response && e.response.data && e.response.data.errors[0].message || e
        console.error(error)
        console.error(e)
        Message({
          message: this.$t('register.error') + error,
          type: 'error'
        })
      }
    }
  }
}
</script>
