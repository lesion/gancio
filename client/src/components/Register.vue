<template lang='pug'>
  b-modal(hide-footer
    @hidden='$router.replace("/")' :title="$t('Register')" :visible='true' @shown='$refs.email.focus()')
    b-form
      p.text-muted(v-html="$t('register_explanation')")
      b-input-group.mb-1
        b-input-group-prepend
          b-input-group-text @
        b-form-input(ref='email' v-model='user.email' type="text" class="form-control" placeholder="Email" autocomplete="email" )

      b-input-group.mb-1
        b-input-group-prepend
          b-input-group-text
            v-icon(name='lock')
        b-form-input(v-model='user.password' type="password" class="form-control" placeholder="Password")

      b-input-group.mb-1
        b-input-group-prepend
          b-input-group-text
            v-icon(name='envelope-open-text')
        b-form-textarea(v-model='user.description' type="text" rows='3' class="form-control" :placeholder="$t('Description')")

      

      b-button.float-right(variant="success" @click='register') {{$t('Send')}}
</template>

<script>
import api from '@/api'
import { mapActions } from 'vuex';
export default {
  name: 'Register',
  data () {
    return {
      error: {},
      user: { }
    }
  },
  methods: {
    ...mapActions(['login']),
    async register () {
      try {
        const user = await api.register(this.user)
        this.$router.go(-1)
        this.$message({
          message: this.$t('registration_complete'),
          type: 'success'
        })
      } catch (e) {
        console.error(e)
      }
    }
  }
}
</script>
