<template lang="pug">
  b-modal(hide-header hide-footer @hide='$router.push("/")' :visible='true')
    h4.text-center {{$t('Settings')}}
      b-form
        b-input-group.mt-1(prepend='Email')
          b-form-input(v-model="user.email")
        //- b-form-checkbox(v-model="tmpUser.user.autoboost") Autoboost
        b-input-group.mt-1(prepend='Mastodon instance')
          b-form-input(v-model="mastodon_instance")
          b-input-group-append
            b-button(@click='associate', variant='primary') Associate

</template>
<script>
import { mapState, mapActions } from 'vuex'
import api from '@/api'
export default {
  props: ['code'],
  data () {
    return {
      mastodon_instance: '',
      user: {}
    }
  },
  computed: mapState(['oauth']),
  async mounted () {
    const code = this.$route.query.code
    if (code) {
      const res = await api.setCode({code})
    }

    const user = await api.getUser()
    this.user = user
    this.mastodon_instance = user.mastodon_instance
  },
  methods: {
      async associate () {
        const url = await api.getAuthURL({instance: this.mastodon_instance})
        setTimeout( () => window.location.href=url, 100);
    }
  }
}
</script>

