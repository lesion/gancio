<template lang="pug">
  b-modal(:title="$t('common.settings')" hide-footer @hidden='$router.replace("/")' :visible='true')
      h5 {{user.name}}
      el-input(v-model="mastodon_instance" @enter.native='associate')
        span(slot='prepend') {{$t('settings.mastodon_instance')}}
        el-button(v-if='!user.mastodon_auth' slot='append' @click='associate' type='success') {{$t('settings.associate')}}
        el-button(v-else slot='append' @click='deassociate' variant='success') {{$t('settings.unassociate')}}
      el-input.mt-2(v-model='password' type='password')
        span(slot='prepend') {{$t('settings.change_password')}}
        el-button(slot='append' @click='change' type='success') {{$t('settings.change')}}
</template>
<script>
import { mapState, mapActions } from 'vuex'
export default {
  props: ['code'],
  data () {
    return {
      mastodon_instance: '',
      password: '',
      user: {}
    }
  },
  computed: mapState(['oauth', 'user']),
  async asyncData ({ $axios, params }) {
    // const code = this.$route.query.code
    // if (code) {
      // const res = await api.setCode({code})
    // }
    const user = await $axios.$get('/auth/user')
    user.mastodon_auth = ''
    return { user } //, mastodon_instance: user.mastodon_auth.instance }
    // this.user = user
    // this.mastodon_instance = user.mastodon_auth.instance
  },
  methods: {
      async change () {
        if (!this.password) return
        const user = this.user
        user.password = this.password
        try {
          await api.updateUser(user)
        } catch (e) {
          console.log(e)
        }
      },
      async deassociate () {
        const user = this.user
        user.mastodon_auth = ''
        this.mastodon_instance = ''
        await api.updateUser(user)
      },
      async associate () {
        if (!this.mastodon_instance) return
        const url = await this.$axios.$post('/user/getauthurl', {instance: this.mastodon_instance})
        setTimeout( () => window.location.href=url, 100);
    }
  }
}
</script>

