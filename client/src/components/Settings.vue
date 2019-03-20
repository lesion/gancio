<template lang="pug">
  b-modal(:title="$t('Settings')" hide-footer @hidden='$router.replace("/")' :visible='true')
      h5 {{user.name}}
      el-input(v-model="mastodon_instance" @enter.native='associate')
        span(slot='prepend') {{$t('Mastodon instance')}}
        el-button(v-if='!user.mastodon_auth' slot='append' @click='associate' type='success') {{$t('Associate')}}
        el-button(v-else slot='append' @click='deassociate' variant='success') {{$t('De-associate')}}
      el-input.mt-2(v-model='password' type='password')
        span(slot='prepend') {{$t('Change password')}}
        el-button(slot='append' @click='change' type='success') {{$t('Change')}}
</template>
<script>
import { mapState, mapActions } from 'vuex'
import api from '@/api'
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
  async mounted () {
    const code = this.$route.query.code
    if (code) {
      const res = await api.setCode({code})
    }

    const user = await api.getUser()
    this.user = user
    this.mastodon_instance = user.mastodon_auth.instance
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
        const url = await api.getAuthURL({instance: this.mastodon_instance})
        setTimeout( () => window.location.href=url, 100);
    }
  }
}
</script>

