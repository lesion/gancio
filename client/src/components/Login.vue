<template lang='pug'>
  b-modal(hide-header hide-footer @shown="$refs.email.focus()"
    @hide='$router.replace("/")' :visible='true')
    h4.text-center.center {{$t('Login')}}
    b-form
      //- p.text-muted Sign In to your account
      b-input-group.mb-1
        b-input-group-prepend
          b-input-group-text
            v-icon(name="user")
        b-form-input(ref='email' v-model="email" type="text" class="form-control" placeholder="E-mail" autocomplete="email")
      b-input-group.mb-3
        b-input-group-prepend
          b-input-group-text
            v-icon(name="lock")
        b-form-input(v-model="password" type="password" class="form-control" placeholder="Password" autocomplete="current-password")
      b-button.float-right(variant="success"  @click='submit') Login
</template>

<script>
import api from '@/api'
import { mapActions } from 'vuex'
import { log } from 'util';

export default {
  name: 'Login',
  data () {
    return {
      password: '',
      email: '',
    }
  },
  methods: {
    ...mapActions(['login']),
    async submit (e) {
      e.preventDefault()
      const user = await api.login(this.email, this.password)
      if (!user) {
        return;
      }
      this.login(user)
      this.email = this.password = ''
      this.$router.go(-1)
    }
  }
}
</script>
